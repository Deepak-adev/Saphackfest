import os
import logging
try:
    from hdbcli import dbapi
except ImportError:
    dbapi = None

logger = logging.getLogger(__name__)

def get_hana_connection():
    if not dbapi:
        logger.warning('hdbcli not installed. Using local SQLite fallback.')
        return None
        
    hana_address = os.environ.get('HANA_ADDRESS')
    hana_port = os.environ.get('HANA_PORT')
    hana_user = os.environ.get('HANA_USER')
    hana_password = os.environ.get('HANA_PASSWORD')
    
    if not all([hana_address, hana_user, hana_password]):
        logger.warning('Missing HANA credentials in .env. Using local SQLite fallback.')
        return None
        
    try:
        conn = dbapi.connect(
            address=hana_address,
            port=int(hana_port) if hana_port else 443,
            user=hana_user,
            password=hana_password,
            encrypt=True
        )
        logger.info('Successfully connected to SAP HANA Cloud.')
        return conn
    except Exception as e:
        logger.error(f'SAP HANA Connection failed: {e}')
        return None
