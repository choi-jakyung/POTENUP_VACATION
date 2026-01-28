@echo off
chcp 65001 >nul
set "SRC=%~dp0..\..\.cursor\projects\c-Users-my-new-project\assets\c__Users_________AppData_Roaming_Cursor_User_workspaceStorage_50a442e0473d780c0ec0bf794a5662e9_images_Wanted_Signature_Primary_Color-c0b92277-dfa9-4a5b-b1ae-1022ccf67890.png"
set "DEST=%~dp0wanted-logo.png"
if exist "%SRC%" (
    copy /Y "%SRC%" "%DEST%" >nul && echo 로고 복사 완료: wanted-logo.png
) else (
    echo 원본 이미지를 찾을 수 없습니다. 원티드 로고 이미지를 이 폴더에 wanted-logo.png 이름으로 넣어주세요.
)
pause
