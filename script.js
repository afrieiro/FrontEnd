// Regex para email conforme sugerida no desafio
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Função de validação genérica
function validateField(value, rules, errorElement) {
    const errors = [];
    
    // Validação de campo vazio
    if (!value || value.trim() === '') {
        errors.push('Este campo não pode estar vazio.');
    } else {
        // MinLength
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`Mínimo ${rules.minLength} caracteres.`);
        }
        // MaxLength
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Máximo ${rules.maxLength} caracteres.`);
        }
        // Regex
        if (rules.regex && !rules.regex.test(value)) {
            errors.push(rules.errorMessage || 'Formato inválido.');
        }
        // Número
        if (rules.isNumber) {
            const num = parseInt(value);
            if (isNaN(num) || num <= 0) {
                errors.push('Deve ser um número inteiro positivo.');
            } else if (num >= 120) {
                errors.push('Idade deve ser menor que 120.');
            }
        }
    }
    
    if (errors.length > 0) {
        errorElement.textContent = errors.join(' ');
        errorElement.style.display = 'block';
        return false;
    }
    errorElement.style.display = 'none';
    return true;
}

// Validação de campos do formulário
function validateForm() {
    const nome = document.getElementById('nome').value.trim();
    const sobrenome = document.getElementById('sobrenome').value.trim();
    const email = document.getElementById('email').value.trim();
    const idade = document.getElementById('idade').value;

    let isValid = true;

    // Validar cada campo
    isValid = validateField(nome, { minLength: 3, maxLength: 50 }, document.getElementById('error-nome')) && isValid;
    isValid = validateField(sobrenome, { minLength: 3, maxLength: 50 }, document.getElementById('error-sobrenome')) && isValid;
    isValid = validateField(email, { regex: emailRegex, errorMessage: 'Email inválido.' }, document.getElementById('error-email')) && isValid;
    isValid = validateField(idade, { isNumber: true }, document.getElementById('error-idade')) && isValid;

    return isValid;
}

// Carregar dados salvos no formulário (para edição)
function loadFormData() {
    const savedData = sessionStorage.getItem('formData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('nome').value = data.nome;
        document.getElementById('sobrenome').value = data.sobrenome;
        document.getElementById('email').value = data.email;
        document.getElementById('idade').value = data.idade;
    }
}

// Handler de submissão do formulário
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    // PÁGINA DO FORMULÁRIO
    if (form) {
        // Carregar dados se vier de "Editar"
        loadFormData();
        
        // Validação em tempo real ao sair do campo (blur)
        document.getElementById('nome').addEventListener('blur', function() {
            validateField(this.value.trim(), { minLength: 3, maxLength: 50 }, document.getElementById('error-nome'));
        });
        
        document.getElementById('sobrenome').addEventListener('blur', function() {
            validateField(this.value.trim(), { minLength: 3, maxLength: 50 }, document.getElementById('error-sobrenome'));
        });
        
        document.getElementById('email').addEventListener('blur', function() {
            validateField(this.value.trim(), { regex: emailRegex, errorMessage: 'Email inválido.' }, document.getElementById('error-email'));
        });
        
        document.getElementById('idade').addEventListener('blur', function() {
            validateField(this.value, { isNumber: true }, document.getElementById('error-idade'));
        });
        
        // Submissão do formulário
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                const formData = {
                    nome: document.getElementById('nome').value.trim(),
                    sobrenome: document.getElementById('sobrenome').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    idade: parseInt(document.getElementById('idade').value)
                };
                
                // Salvar temporariamente
                sessionStorage.setItem('formData', JSON.stringify(formData));
                
                // Redirecionar para confirmação
                window.location.href = 'confirmation.html';
            }
        });
    }

    // PÁGINA DE CONFIRMAÇÃO
    const confirmBtn = document.getElementById('confirm-btn');
    const editBtn = document.getElementById('edit-btn');
    
    if (confirmBtn && editBtn) {
        const savedData = sessionStorage.getItem('formData');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Exibir dados na página
            document.getElementById('conf-nome').textContent = data.nome;
            document.getElementById('conf-sobrenome').textContent = data.sobrenome;
            document.getElementById('conf-email').textContent = data.email;
            document.getElementById('conf-idade').textContent = data.idade;

            // Botão CONFIRMAR
            confirmBtn.addEventListener('click', function() {
                // Criar arquivo data.json para download
                const jsonData = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'data.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Limpar dados temporários
                sessionStorage.removeItem('formData');
                
                // Redirecionar para index
                alert('Dados salvos com sucesso!');
                window.location.href = 'index.html';
            });

            // Botão EDITAR
            editBtn.addEventListener('click', function() {
                // Manter dados para edição
                window.location.href = 'form.html';
            });
        } else {
            // Se não houver dados, redirecionar para o formulário
            alert('Nenhum dado encontrado. Preencha o formulário primeiro.');
            window.location.href = 'form.html';
        }
    }
});