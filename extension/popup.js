function extractDomain(url) {
    let hostname;
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    return hostname;
}

document.addEventListener('DOMContentLoaded', function() {
    const thirdPartyBtn = document.getElementById('thirdPartyBtn');
    const localStorageBtn = document.getElementById('localStorageBtn');
    const resultTable = document.getElementById('resultTable');
    const cookiesBtn = document.getElementById('cookiesBtn');
    const privacyScoreBtn = document.getElementById('privacyScoreBtn');
    const canvasBtn = document.getElementById('canvasBtn');
    const hijackingBtn = document.getElementById('hijackingBtn');

    function clearResults() {
        while (resultTable.firstChild) {
            resultTable.removeChild(resultTable.firstChild);
        }
    }

    function isJSON(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        let currentTab = tabs[0];
        let tabId = currentTab.id;

        thirdPartyBtn.addEventListener('click', function() {
            clearResults();
            browser.runtime.sendMessage({ command: 'getThirdPartyDomains', tabId: tabId })
                .then(response => {
                    let domains = response.domains;

                    if (domains.length > 0) {
                        let header = resultTable.createTHead();
                        let headerRow = header.insertRow(0);
                        let domainCell = document.createElement('th');
                        domainCell.textContent = 'Domínio de Terceira Parte';
                        headerRow.appendChild(domainCell);

                        let tbody = document.createElement('tbody');

                        domains.forEach(domain => {
                            let row = tbody.insertRow();
                            let cellDomain = row.insertCell();
                            cellDomain.textContent = domain;
                        });

                        resultTable.appendChild(tbody);
                    } else {
                        let row = resultTable.insertRow();
                        let cell = row.insertCell();
                        cell.textContent = 'Nenhum domínio de terceira parte detectado.';
                    }
                })
                .catch(error => {
                    console.error('Erro ao obter domínios de terceira parte:', error);
                });
        });

        localStorageBtn.addEventListener('click', function() {
            clearResults();
            browser.runtime.sendMessage({ command: 'getLocalStorageData', tabId: tabId })
                .then(response => {
                    let data = response.data;

                    if (data.length > 0) {
                        let header = resultTable.createTHead();
                        let headerRow = header.insertRow(0);
                        let keyCell = document.createElement('th');
                        keyCell.textContent = 'Chave';
                        let valueCell = document.createElement('th');
                        valueCell.textContent = 'Valor';
                        headerRow.appendChild(keyCell);
                        headerRow.appendChild(valueCell);

                        let tbody = document.createElement('tbody');

                        data.forEach(item => {
                            let row = tbody.insertRow();

                            let cellKey = row.insertCell();
                            cellKey.textContent = item.key;

                            let cellValue = row.insertCell();

                            if (isJSON(item.value)) {
                                let jsonValue = JSON.parse(item.value);
                                let pre = document.createElement('pre');
                                pre.textContent = JSON.stringify(jsonValue, null, 2);
                                cellValue.appendChild(pre);
                            } else {
                                cellValue.textContent = item.value;
                            }
                        });

                        resultTable.appendChild(tbody);
                    } else {
                        let row = resultTable.insertRow();
                        let cell = row.insertCell();
                        cell.colSpan = 2;
                        cell.textContent = 'Nenhum dado de armazenamento local detectado.';
                    }
                })
                .catch(error => {
                    console.error('Erro ao obter dados do armazenamento local:', error);
                });
        });

        cookiesBtn.addEventListener('click', function() {
            clearResults();
            browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                let currentTab = tabs[0];
                let url = currentTab.url;
                let tabDomain = extractDomain(url);
        
                browser.cookies.getAll({ url: url }).then((cookies) => {
                    if (cookies.length > 0) {
                        let header = resultTable.createTHead();
                        let headerRow = header.insertRow(0);
                        let nameCell = document.createElement('th');
                        nameCell.textContent = 'Nome';
                        let domainCell = document.createElement('th');
                        domainCell.textContent = 'Domínio';
                        let typeCell = document.createElement('th');
                        typeCell.textContent = 'Tipo';
                        let sessionCell = document.createElement('th');
                        sessionCell.textContent = 'Sessão/Persistente';
                        headerRow.appendChild(nameCell);
                        headerRow.appendChild(domainCell);
                        headerRow.appendChild(typeCell);
                        headerRow.appendChild(sessionCell);
        
                        let tbody = document.createElement('tbody');
        
                        cookies.forEach(cookie => {
                            let row = tbody.insertRow();
        
                            let cellName = row.insertCell();
                            cellName.textContent = cookie.name;
        
                            let cellDomain = row.insertCell();
                            cellDomain.textContent = cookie.domain;
        
                            let cellType = row.insertCell();
                            let cookieDomain = cookie.domain.replace(/^\./, '');
                            if (tabDomain.endsWith(cookieDomain)) {
                                cellType.textContent = 'Primeira Parte';
                            } else {
                                cellType.textContent = 'Terceira Parte';
                            }
        
                            let cellSession = row.insertCell();
                            cellSession.textContent = cookie.session ? 'Sessão' : 'Persistente';
                        });
        
                        resultTable.appendChild(tbody);
                    } else {
                        let row = resultTable.insertRow();
                        let cell = row.insertCell();
                        cell.textContent = 'Nenhum cookie encontrado.';
                    }
                });
            });
        });

        canvasBtn.addEventListener('click', function() {
            clearResults();
            browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                let tabId = tabs[0].id;
                browser.runtime.sendMessage({ command: 'getCanvasFingerprinting', tabId: tabId }).then(response => {
                    let canvasDetected = response.detected || false;
                    let row = resultTable.insertRow();
                    let cell = row.insertCell();
                    cell.colSpan = 2;
                    cell.innerHTML = canvasDetected ? 'Canvas Fingerprinting detectado!' : 'Nenhum Canvas Fingerprinting detectado.';
                }).catch(error => {
                    console.error('Erro ao obter a detecção de Canvas Fingerprinting:', error);
                });
            });
        });

        hijackingBtn.addEventListener('click', function() {
            clearResults();
            browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                let tabId = tabs[0].id;
                browser.runtime.sendMessage({ command: 'getHijackingAttempts', tabId: tabId }).then(response => {
                    let hijackingDetected = response.detected || false;
                    let row = resultTable.insertRow();
                    let cell = row.insertCell();
                    cell.colSpan = 2;
                    if (hijackingDetected) {
                        cell.innerHTML = `Possível Hijacking detectado! Redirecionamento para: ${hijackingDetected}`;
                    } else {
                        cell.innerHTML = 'Nenhuma tentativa de Hijacking detectada.';
                    }
                }).catch(error => {
                    console.error('Erro ao obter dados de Hijacking:', error);
                });
            });
        });

        privacyScoreBtn.addEventListener('click', function() {
            clearResults();
            browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                let currentTab = tabs[0];
                let tabId = currentTab.id;
                let url = currentTab.url;
                let tabDomain = extractDomain(url);
        
                Promise.all([
                    browser.runtime.sendMessage({ command: 'getThirdPartyDomains', tabId: tabId }),
                    browser.cookies.getAll({ url: url }),
                    browser.runtime.sendMessage({ command: 'getLocalStorageData', tabId: tabId }),
                    browser.runtime.sendMessage({ command: 'getCanvasFingerprinting', tabId: tabId }),
                    browser.runtime.sendMessage({ command: 'getHijackingAttempts', tabId: tabId })
                ]).then(([domainsResponse, cookies, storageResponse, canvasResponse, hijackingResponse]) => {
                    let thirdPartyDomains = domainsResponse.domains;
                    let localStorageData = storageResponse.data;
                    let canvasDetected = canvasResponse.detected;
                    let hijackingDetected = hijackingResponse.detected;
        
                    let totalScore = 0;
        
                    // Domínios de Terceira Parte (35%)
                    let domainScore = Math.min(thirdPartyDomains.length, 10);
                    totalScore += (domainScore / 10) * 35;
        
                    // Cookies de Terceira Parte (25%)
                    let thirdPartyCookies = cookies.filter(cookie => {
                        let cookieDomain = cookie.domain.replace(/^\./, '');
                        return !tabDomain.endsWith(cookieDomain);
                    });
                    let cookieScore = Math.min(thirdPartyCookies.length, 10);
                    totalScore += (cookieScore / 10) * 25;
        
                    // Uso de Armazenamento Local (10%)
                    let storageScore = localStorageData.length > 0 ? 10 : 0;
                    totalScore += storageScore;
        
                    // Canvas Fingerprinting (10%)
                    let canvasScore = canvasDetected ? 10 : 0;
                    totalScore += canvasScore;
        
                    // Hijacking Detectado (20%)
                    let hijackingScore = hijackingDetected ? 20 : 0;
                    totalScore += hijackingScore;
        
                    let emoji = '';
                    let privacyClass = '';
                    if (totalScore <= 20) {
                        emoji = '😎'; 
                        privacyClass = 'good-privacy';
                    } else if (totalScore <= 50) {
                        emoji = '🤨'; 
                        privacyClass = 'medium-privacy';
                    } else {
                        emoji = '😢'; 
                        privacyClass = 'poor-privacy';
                    }
        
                    let row = resultTable.insertRow();
                    let cell = row.insertCell();
                    cell.colSpan = 2;
                    cell.innerHTML = `<strong class="${privacyClass}">Pontuação de Privacidade: ${totalScore.toFixed(2)} / 100 ${emoji}</strong><br>(Quanto menor, melhor a privacidade)`;
        
                    let detailsRow = resultTable.insertRow();
                    let detailsCell = detailsRow.insertCell();
                    detailsCell.colSpan = 2;
                    detailsCell.innerHTML = `
                        <ul>
                            <li>Domínios de Terceira Parte: ${thirdPartyDomains.length}</li>
                            <li>Cookies de Terceira Parte: ${thirdPartyCookies.length}</li>
                            <li>Itens de Armazenamento Local: ${localStorageData.length}</li>
                            <li>Canvas Fingerprinting: ${canvasDetected ? 'Sim' : 'Não'}</li>
                            <li>Hijacking Detectado: ${hijackingDetected ? 'Sim' : 'Não'}</li>
                        </ul>
                    `;
                }).catch(error => {
                    console.error('Erro ao calcular a pontuação de privacidade:', error);
                });
            });
        });
    });
});