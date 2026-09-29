import os
import logging

logger = logging.getLogger(__name__)

def get_ai_core_model():
    ai_core_client_id = os.environ.get('AICORE_CLIENT_ID')
    
    if not ai_core_client_id:
        logger.warning('Missing SAP AI Core credentials. Using local deterministic fallback.')
        return None
        
    try:
        from generative_ai_hub.proxy.core.proxy_clients import get_proxy_client
        client = get_proxy_client('gen-ai-hub')
        logger.info('Successfully connected to SAP Generative AI Hub.')
        return client
    except ImportError:
        logger.warning('generative-ai-hub-sdk not installed.')
        return None
    except Exception as e:
        logger.error(f'SAP AI Core Connection failed: {e}')
        return None
