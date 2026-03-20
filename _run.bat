@echo off
call C:\Users\ISMS\anaconda3\Scripts\activate.bat env_uma
python -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('Current device:', torch.cuda.current_device() if torch.cuda.is_available() else 'CPU'); print('Device name:', torch.cuda.get_device_name(torch.cuda.current_device()) if torch.cuda.is_available() else 'CPU')"
python main.py
pause