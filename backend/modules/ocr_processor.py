import logging
import pytesseract
import cv2
import numpy as np
from PIL import Image

class OCRProcessor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.config = {
            'lang': 'eng',
            'config': '--psm 11'  # Page segmentation mode: Sparse text
        }

    def check_status(self):
        """
        Check if OCR system is properly initialized
        """
        try:
            # Simple test to verify pytesseract is working
            test_image = Image.new('RGB', (100, 30), color='white')
            pytesseract.image_to_string(test_image)
            return True
        except Exception as e:
            self.logger.error(f"OCR system check failed: {str(e)}")
            return False

    def preprocess_image(self, image):
        """
        Preprocess image for better OCR results
        """
        try:
            # Convert to grayscale if not already
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image

            # Apply thresholding to get black and white image
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # Noise removal
            denoised = cv2.medianBlur(binary, 3)

            return denoised
        except Exception as e:
            self.logger.error(f"Error preprocessing image: {str(e)}")
            return None

    def find_text(self, image, target_text):
        """
        Find the location of specific text in the image
        Returns the center coordinates of the found text
        """
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image)
            if processed_image is None:
                return None

            # Get detailed OCR data including bounding boxes
            data = pytesseract.image_to_data(
                processed_image,
                lang=self.config['lang'],
                config=self.config['config'],
                output_type=pytesseract.Output.DICT
            )

            # Search for target text
            for i, text in enumerate(data['text']):
                if text.lower() == target_text.lower():
                    # Calculate center of bounding box
                    x = data['left'][i]
                    y = data['top'][i]
                    w = data['width'][i]
                    h = data['height'][i]
                    
                    center_x = x + w // 2
                    center_y = y + h // 2
                    
                    return (center_x, center_y)

            return None
        except Exception as e:
            self.logger.error(f"Error finding text: {str(e)}")
            return None

    def extract_all_text(self, image):
        """
        Extract all text from the image
        """
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image)
            if processed_image is None:
                return None

            # Perform OCR
            text = pytesseract.image_to_string(
                processed_image,
                lang=self.config['lang'],
                config=self.config['config']
            )

            return text.strip()
        except Exception as e:
            self.logger.error(f"Error extracting text: {str(e)}")
            return None

    def get_text_confidence(self, image, text):
        """
        Get confidence score for specific text in the image
        """
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image)
            if processed_image is None:
                return 0

            # Get OCR data with confidence scores
            data = pytesseract.image_to_data(
                processed_image,
                lang=self.config['lang'],
                config=self.config['config'],
                output_type=pytesseract.Output.DICT
            )

            # Find highest confidence score for target text
            max_conf = 0
            for i, word in enumerate(data['text']):
                if word.lower() == text.lower():
                    conf = float(data['conf'][i])
                    max_conf = max(max_conf, conf)

            return max_conf / 100.0  # Convert to 0-1 range
        except Exception as e:
            self.logger.error(f"Error getting text confidence: {str(e)}")
            return 0

    def update_config(self, new_config):
        """
        Update OCR configuration
        """
        try:
            self.config.update(new_config)
            return True
        except Exception as e:
            self.logger.error(f"Error updating config: {str(e)}")
            return False