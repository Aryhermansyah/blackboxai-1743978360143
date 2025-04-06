import logging
import pyautogui
import cv2
import numpy as np
from PIL import Image
import time
from .ocr_processor import OCRProcessor

class LightroomController:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.ocr = OCRProcessor()
        self.config = {
            'confidence_threshold': 0.8,
            'click_delay': 0.5,
            'screenshot_region': None  # Full screen by default
        }

    def check_connection(self):
        """
        Check if Lightroom is running and accessible
        """
        try:
            # Try to locate the Lightroom window
            # This is a placeholder - actual implementation would need to identify Lightroom-specific UI elements
            return True
        except Exception as e:
            self.logger.error(f"Error checking Lightroom connection: {str(e)}")
            return False

    def update_config(self, new_config):
        """
        Update controller configuration
        """
        try:
            self.config.update(new_config)
            return True
        except Exception as e:
            self.logger.error(f"Error updating config: {str(e)}")
            return False

    def take_screenshot(self):
        """
        Capture screenshot of Lightroom interface
        """
        try:
            screenshot = pyautogui.screenshot(region=self.config['screenshot_region'])
            return np.array(screenshot)
        except Exception as e:
            self.logger.error(f"Error taking screenshot: {str(e)}")
            return None

    def locate_ui_element(self, element_name):
        """
        Locate a UI element using OCR and image processing
        """
        try:
            screenshot = self.take_screenshot()
            if screenshot is None:
                return None

            # Convert screenshot to grayscale for OCR
            gray = cv2.cvtColor(screenshot, cv2.COLOR_BGR2GRAY)
            
            # Use OCR to find text elements
            element_location = self.ocr.find_text(gray, element_name)
            
            if element_location:
                return element_location
            else:
                self.logger.warning(f"UI element '{element_name}' not found")
                return None
        except Exception as e:
            self.logger.error(f"Error locating UI element: {str(e)}")
            return None

    def click_element(self, element_name):
        """
        Click on a UI element
        """
        try:
            location = self.locate_ui_element(element_name)
            if location:
                x, y = location
                pyautogui.click(x, y)
                time.sleep(self.config['click_delay'])
                return True
            return False
        except Exception as e:
            self.logger.error(f"Error clicking element: {str(e)}")
            return False

    def adjust_slider(self, slider_name, value):
        """
        Adjust a slider control to a specific value
        """
        try:
            # Locate the slider
            slider_location = self.locate_ui_element(slider_name)
            if not slider_location:
                return False

            # Calculate target position based on value
            x, y = slider_location
            target_x = x + (value * 100)  # Simplified calculation - needs calibration
            
            # Move slider
            pyautogui.moveTo(x, y)
            pyautogui.mouseDown()
            pyautogui.moveTo(target_x, y)
            pyautogui.mouseUp()
            
            return True
        except Exception as e:
            self.logger.error(f"Error adjusting slider: {str(e)}")
            return False

    def apply_preset(self, preset_name):
        """
        Apply a Lightroom preset
        """
        try:
            # Click presets panel if not already open
            self.click_element("Presets")
            
            # Locate and click the specific preset
            if self.click_element(preset_name):
                self.logger.info(f"Applied preset: {preset_name}")
                return True
            
            self.logger.warning(f"Failed to apply preset: {preset_name}")
            return False
        except Exception as e:
            self.logger.error(f"Error applying preset: {str(e)}")
            return False

    def export_photo(self, export_settings=None):
        """
        Export the current photo with specified settings
        """
        try:
            # Click export button
            if not self.click_element("Export"):
                return False

            if export_settings:
                # Apply export settings
                for setting, value in export_settings.items():
                    if not self.adjust_export_setting(setting, value):
                        return False

            # Confirm export
            return self.click_element("Export")
        except Exception as e:
            self.logger.error(f"Error exporting photo: {str(e)}")
            return False

    def adjust_export_setting(self, setting_name, value):
        """
        Adjust an export setting
        """
        try:
            # Locate and adjust the specific setting
            setting_location = self.locate_ui_element(setting_name)
            if setting_location:
                x, y = setting_location
                pyautogui.click(x, y)
                pyautogui.write(str(value))
                pyautogui.press('enter')
                return True
            return False
        except Exception as e:
            self.logger.error(f"Error adjusting export setting: {str(e)}")
            return False