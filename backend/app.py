from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
from modules.lightroom_controller import LightroomController
from modules.chat_commands import ChatCommandProcessor
from modules.ocr_processor import OCRProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create necessary directories
os.makedirs('logs', exist_ok=True)
os.makedirs('data', exist_ok=True)

app = Flask(__name__)
CORS(app)

# Initialize controllers
lightroom_controller = LightroomController()
chat_processor = ChatCommandProcessor(lightroom_controller)
ocr_processor = OCRProcessor()

@app.route('/api/config', methods=['GET', 'POST'])
def handle_config():
    try:
        if request.method == 'GET':
            config = {
                'status': 'running',
                'lightroom_connected': lightroom_controller.check_connection(),
                'ocr_status': ocr_processor.check_status()
            }
            return jsonify(config)
        else:
            data = request.json
            # Update configuration
            success = lightroom_controller.update_config(data)
            return jsonify({'success': success})
    except Exception as e:
        logger.error(f"Error in config endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/command', methods=['POST'])
def handle_command():
    try:
        data = request.json
        command = data.get('command')
        if not command:
            return jsonify({'error': 'No command provided'}), 400

        # Process command through chat processor
        result = chat_processor.process_command(command)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing command: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/training/upload', methods=['POST'])
def handle_training_upload():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Save file to data directory
        filename = os.path.join('data', file.filename)
        file.save(filename)
        
        return jsonify({
            'success': True,
            'message': 'File uploaded successfully',
            'filename': file.filename
        })
    except Exception as e:
        logger.error(f"Error handling file upload: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)