import logging
import re
from typing import Dict, Any, Tuple

class ChatCommandProcessor:
    def __init__(self, lightroom_controller):
        self.logger = logging.getLogger(__name__)
        self.lightroom_controller = lightroom_controller
        
        # Define command patterns and their corresponding actions
        self.command_patterns = {
            r'adjust\s+(?P<parameter>\w+)\s+to\s+(?P<value>-?\d+)': self._handle_adjustment,
            r'apply\s+preset\s+(?P<preset_name>[\w\s]+)': self._handle_preset,
            r'export(\s+with\s+(?P<settings>[\w\s,]+))?': self._handle_export,
            r'undo(\s+last)?': self._handle_undo,
            r'reset(\s+all)?': self._handle_reset,
            r'help': self._handle_help
        }

    def process_command(self, command: str) -> Dict[str, Any]:
        """
        Process a natural language command and execute corresponding Lightroom actions
        """
        try:
            command = command.lower().strip()
            
            # Try to match command against known patterns
            for pattern, handler in self.command_patterns.items():
                match = re.match(pattern, command)
                if match:
                    return handler(match.groupdict())
            
            # If no pattern matches, try to interpret as a custom command
            return self._handle_custom_command(command)
            
        except Exception as e:
            self.logger.error(f"Error processing command '{command}': {str(e)}")
            return {
                'success': False,
                'error': f"Failed to process command: {str(e)}",
                'command': command
            }

    def _handle_adjustment(self, params: Dict[str, str]) -> Dict[str, Any]:
        """
        Handle adjustment commands like "adjust exposure to 1.5"
        """
        try:
            parameter = params['parameter']
            value = float(params['value'])
            
            success = self.lightroom_controller.adjust_slider(parameter, value)
            
            return {
                'success': success,
                'action': 'adjustment',
                'parameter': parameter,
                'value': value,
                'message': f"Adjusted {parameter} to {value}" if success else f"Failed to adjust {parameter}"
            }
        except Exception as e:
            self.logger.error(f"Error handling adjustment: {str(e)}")
            return {
                'success': False,
                'action': 'adjustment',
                'error': str(e)
            }

    def _handle_preset(self, params: Dict[str, str]) -> Dict[str, Any]:
        """
        Handle preset application commands
        """
        try:
            preset_name = params['preset_name']
            success = self.lightroom_controller.apply_preset(preset_name)
            
            return {
                'success': success,
                'action': 'preset',
                'preset': preset_name,
                'message': f"Applied preset {preset_name}" if success else f"Failed to apply preset {preset_name}"
            }
        except Exception as e:
            self.logger.error(f"Error handling preset: {str(e)}")
            return {
                'success': False,
                'action': 'preset',
                'error': str(e)
            }

    def _handle_export(self, params: Dict[str, str]) -> Dict[str, Any]:
        """
        Handle export commands with optional settings
        """
        try:
            settings = {}
            if params.get('settings'):
                # Parse export settings from command
                setting_pairs = params['settings'].split(',')
                for pair in setting_pairs:
                    key, value = pair.strip().split()
                    settings[key] = value

            success = self.lightroom_controller.export_photo(settings)
            
            return {
                'success': success,
                'action': 'export',
                'settings': settings,
                'message': "Export completed successfully" if success else "Export failed"
            }
        except Exception as e:
            self.logger.error(f"Error handling export: {str(e)}")
            return {
                'success': False,
                'action': 'export',
                'error': str(e)
            }

    def _handle_undo(self, params: Dict[str, str]) -> Dict[str, Any]:
        """
        Handle undo commands
        """
        try:
            # Simulate Ctrl+Z or Command+Z
            success = self.lightroom_controller.click_element("Undo")
            
            return {
                'success': success,
                'action': 'undo',
                'message': "Undo successful" if success else "Undo failed"
            }
        except Exception as e:
            self.logger.error(f"Error handling undo: {str(e)}")
            return {
                'success': False,
                'action': 'undo',
                'error': str(e)
            }

    def _handle_reset(self, params: Dict[str, str]) -> Dict[str, Any]:
        """
        Handle reset commands
        """
        try:
            # Click reset button
            success = self.lightroom_controller.click_element("Reset")
            
            return {
                'success': success,
                'action': 'reset',
                'message': "Reset successful" if success else "Reset failed"
            }
        except Exception as e:
            self.logger.error(f"Error handling reset: {str(e)}")
            return {
                'success': False,
                'action': 'reset',
                'error': str(e)
            }

    def _handle_help(self, params: Dict[str, str]) -> Dict[str, Any]:
        """
        Handle help commands
        """
        help_text = """
        Available commands:
        - adjust [parameter] to [value]: Adjust a slider (e.g., "adjust exposure to 1.5")
        - apply preset [name]: Apply a preset
        - export: Export the current photo
        - export with [settings]: Export with specific settings
        - undo: Undo last action
        - reset: Reset all adjustments
        - help: Show this help message
        """
        
        return {
            'success': True,
            'action': 'help',
            'message': help_text
        }

    def _handle_custom_command(self, command: str) -> Dict[str, Any]:
        """
        Handle custom or complex commands using natural language processing
        """
        # This is a placeholder for more sophisticated command interpretation
        return {
            'success': False,
            'error': 'Command not recognized',
            'command': command,
            'suggestion': 'Try "help" for a list of available commands'
        }

    def _parse_parameters(self, command: str) -> Tuple[str, Dict[str, Any]]:
        """
        Parse parameters from a command string
        """
        try:
            # Split command into action and parameters
            parts = command.split()
            action = parts[0]
            
            # Parse parameters (key=value pairs)
            params = {}
            for part in parts[1:]:
                if '=' in part:
                    key, value = part.split('=')
                    params[key] = value
                    
            return action, params
        except Exception as e:
            self.logger.error(f"Error parsing parameters: {str(e)}")
            return None, {}