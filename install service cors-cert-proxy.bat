msiexec.exe /i "%~dp0Proxy\node-v14.16.0-x64.msi" /passive
# kopiera in NSSM, som installerar NodeJS-proxyn som en Service
xcopy /d /i /s /y /z "%~dp0Proxy\nssm" "C:\Program Files\Proxy\nssm" 

# kopiera cors-cert-anywhere till Program Files
xcopy /d /i /s /y /z "%~dp0Proxy\cors-cert-anywhere" "C:\Program Files\Proxy\cors-cert-anywhere" 
"C:\Program Files\Proxy\nssm\win64\nssm" install cors-cert-proxy "C:\Program Files\nodejs\node.exe" 
"C:\Program Files\Proxy\nssm\win64\nssm" set cors-cert-proxy AppDirectory "C:\Program Files\Proxy\cors-cert-anywhere" 
"C:\Program Files\Proxy\nssm\win64\nssm" set cors-cert-proxy AppParameters "cors-cert-server.js"
"C:\Program Files\Proxy\nssm\win64\nssm" start cors-cert-proxy

pause

