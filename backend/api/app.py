# app.py
import matplotlib
matplotlib.use('Agg')
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from flask_cors import CORS
import numpy as np
import io
from PIL import Image
import cv2
import matplotlib.pyplot as plt
import base64

app = Flask(__name__)
CORS(app)

# Load classification model
classification_model = load_model("densenet121_finetuned.h5")
class_labels = [
    'No DR', 
    'Mild Non-Proliferative DR (NPDR)', 
    'Moderate DR', 
    'Severe DR', 
    'Proliferative DR (PDR)'
]

# Load segmentation model
segmentation_model = load_model("unet_model.h5", compile=False)

IMG_SIZE = 256
lesion_types = ["Haemorrhages", "Hard_Exudates", "Microaneurysms", "Optic_Disc"]

def preprocess_image(img_path):
    img = cv2.imread(img_path)
    if img is None:
        raise FileNotFoundError(f"Image not found at path: {img_path}")
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype('float32') / 255.0
    return img

def preprocess_image_array(img):
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img = image.img_to_array(img)
    img = img.astype('float32') / 255.0
    return img

def get_prediction_plot(img_array, model):
    pred = model.predict(np.expand_dims(img_array, axis=0))[0]

    fig, axs = plt.subplots(1, 4, figsize=(16, 5))
    axs[0].imshow(img_array)
    axs[0].set_title("Original Image")

    selected_classes = [1, 3]  # Hard_Exudates & Optic_Disc
    for i, c in enumerate(selected_classes):
        axs[i+1].imshow(pred[:, :, c], cmap='gray')
        axs[i+1].set_title(f"Predicted {lesion_types[c]}")

    combined_pred = np.sum(pred[:, :, selected_classes], axis=-1)
    axs[3].imshow(combined_pred, cmap='hot')
    axs[3].set_title("Prediction Heatmap")

    plt.tight_layout()

    # Convert plot to PNG image
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close(fig)
    
    # Encode the PNG image to base64 string
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return image_base64

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    img = Image.open(io.BytesIO(file.read())).convert("RGB")
    img_resized = img.resize((224, 224))
    img_array = image.img_to_array(img_resized)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    predictions = classification_model.predict(img_array)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_label = class_labels[predicted_class_index]

    return jsonify({'prediction': predicted_label})

@app.route('/segment', methods=['POST'])
def segment():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    
    # Read and preprocess image to match training setup (BGR via OpenCV)
    try:
        img = Image.open(io.BytesIO(file.read())).convert("RGB")
        img = np.array(img)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img.astype('float32') / 255.0
    except Exception as e:
        return jsonify({'error': f'Image preprocessing failed: {str(e)}'}), 500

    try:
        result_image = get_prediction_plot(img, segmentation_model)
        return jsonify({'segmentation_result': result_image})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
