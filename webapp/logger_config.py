import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logger(app):
    """Configure application logging for user activity tracking"""

    # Create logs directory if it doesn't exist
    log_dir = os.path.join(app.root_path, '..', 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Configure login activity logger
    login_logger = logging.getLogger('login_activity')
    login_logger.setLevel(logging.INFO)
    login_handler = RotatingFileHandler(
        os.path.join(log_dir, 'login_activity.log'),
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    login_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    login_handler.setFormatter(login_formatter)
    login_logger.addHandler(login_handler)

    # Configure portfolio activity logger
    portfolio_logger = logging.getLogger('portfolio_activity')
    portfolio_logger.setLevel(logging.INFO)
    portfolio_handler = RotatingFileHandler(
        os.path.join(log_dir, 'portfolio_activity.log'),
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    portfolio_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    portfolio_handler.setFormatter(portfolio_formatter)
    portfolio_logger.addHandler(portfolio_handler)

    app.logger.info('Logging system initialized')
