# ====================================================================
# MEU PESCADO - GERADOR DE LINK PUBLICO COM ACESSO TOTAL
# ====================================================================

$ErrorActionPreference = "Continue"
$projectRoot = "c:\BARRISENN\COLLERMHANN\MeuPescado-Assistant"
$backendPath = "$projectRoot\backend"
$pythonExe = "$backendPath\venv\Scripts\python.exe"
$cloudflaredExe = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$logFile = "$projectRoot\tunnel_output.log"
$linkTxtFile = "$projectRoot\LINK_ACESSO_TOTAL_COMPRADOR.txt"

Clear-Host
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       MEU PESCADO - SISTEMA DE GESTAO DE CARCINICULTURA & IA   " -ForegroundColor Yellow
Write-Host "       GERANDO LINK PUBLICO PARA DEMONSTRACAO / TESTES          " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Finaliza instancias antigas
Get-Process -Name cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}

Start-Sleep -Seconds 1

# 2. Inicia o backend FastAPI (serve API + React SPA unificados)
Write-Host "[1/3] Iniciando Servidor de Producao (FastAPI + React 19)..." -ForegroundColor White
$backendProc = Start-Process -FilePath $pythonExe -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory $backendPath -WindowStyle Hidden -PassThru

# Aguarda a porta 8000 ficar ativa
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    $conn = Test-NetConnection -Port 8000 -ComputerName 127.0.0.1 -WarningAction SilentlyContinue
    if ($conn.TcpTestSucceeded) {
        $ready = $true
        break
    }
}

if (-not $ready) {
    Write-Host "ERRO: O servidor backend nao respondeu na porta 8000." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[2/3] Servidor local ativo com sucesso na porta 8000." -ForegroundColor Green

# 3. Inicia o Cloudflare Tunnel Seguro HTTPS
Write-Host "[3/3] Estabelecendo Tunel Seguro HTTPS (Cloudflare)..." -ForegroundColor White
if (Test-Path $logFile) { Remove-Item $logFile -Force -ErrorAction SilentlyContinue }

$tunnelProc = Start-Process -FilePath $cloudflaredExe -ArgumentList "tunnel --protocol http2 --url http://127.0.0.1:8000" -RedirectStandardError $logFile -WindowStyle Hidden -PassThru

# Extrai a URL gerada
$tunnelUrl = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
        if ($content -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
            $tunnelUrl = $matches[0]
            break
        }
    }
}

if ($tunnelUrl) {
    # Salva no arquivo de texto
    $infoText = @"
======================================================================
  MEU PESCADO - LINK DE DEMONSTRACAO TOTAL (SEM TRAVAS / SEM LOGIN)
======================================================================

LINK DE ACESSO DO COMPRADOR / DEMO:
$tunnelUrl

DOCUMENTACAO COMPLETA DA API (SWAGGER):
$tunnelUrl/docs

DATA DE GERACAO: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')
STATUS: 100% OPERACIONAL E DESBLOQUEADO

INFORMACOES DE USO:
- Este link pode ser acessado de qualquer smartphone, tablet ou computador do mundo.
- Todos os 16 modulos estao 100% liberados (Dashboard, Viveiros, Biometria,
  Qualidade da Agua, Despesca, Copilot IA, Estoque, WhatsApp Bot, Notas Fiscais,
  Equipamentos, Comercial e Fluxo de Caixa).
- Nenhuma senha, chave ou pagamento e exigido.
- Enquanto esta janela ou o processo estiver ativo no seu computador, o comprador pode testar tudo livremente.
======================================================================
"@
    Set-Content -Path $linkTxtFile -Value $infoText -Encoding UTF8
    
    # Copia para a area de transferencia
    Set-Clipboard -Value $tunnelUrl

    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "          SUCESSO! SEU LINK PUBLICO ESTA PRONTO E NO AR:        " -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  URL: $tunnelUrl" -ForegroundColor Cyan -BackgroundColor Black
    Write-Host ""
    Write-Host "  [OK] O link foi copiado para sua Area de Transferencia (Ctrl + V)" -ForegroundColor Green
    Write-Host "  [OK] Todos os modulos, dados e IA estao 100% liberados sem travas" -ForegroundColor Green
    Write-Host "  [OK] Arquivo salvo em: $linkTxtFile" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pressione qualquer tecla para abrir o link no seu navegador..." -ForegroundColor Yellow
    
    # Abre o navegador
    Start-Process $tunnelUrl

    Write-Host "Mantenha esta janela aberta enquanto voce ou o comprador estiverem testando." -ForegroundColor DarkCyan
    
    # Mantem o script esperando
    Wait-Process -Id $tunnelProc.Id
} else {
    Write-Host "Nao foi possivel detectar o link a tempo. Verifique o arquivo $logFile" -ForegroundColor Red
}
