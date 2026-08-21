// supabaseService.js

const SupabaseService = {
    // Cabeçalhos padrão exigidos pelo Supabase REST API
    getHeaders() {
        return {
            'apikey': VARIABLES_CONFIG.anonKey,
            'Authorization': `Bearer ${VARIABLES_CONFIG.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    },

    // ==========================================
    // 1. CURSOS (SELECT, INSERT, UPDATE, DELETE)
    // ==========================================
    async listarCursos() {
        try {
            const response = await fetch(`${VARIABLES_CONFIG.url}${VARIABLES_CONFIG.tabela_cursos}?select=*`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao listar cursos:', error);
            return [];
        }
    },

    // ==========================================
    // 2. DISCIPLINAS (SELECT)
    // ==========================================
    async listarDisciplinas() {
        try {
            const response = await fetch(`${VARIABLES_CONFIG.url}${VARIABLES_CONFIG.tabela_disciplinas}?select=*`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao listar disciplinas:', error);
            return [];
        }
    },

    // ==========================================
    // 3. USUÁRIOS (SELECT, INSERT, UPDATE - Sem Delete)
    // ==========================================
    async cadastrarUsuario(dadosUsuario) {
        try {
            const response = await fetch(`${VARIABLES_CONFIG.url}${VARIABLES_CONFIG.tabela_usuario}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(dadosUsuario)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            return { error };
        }
    },

    async buscarUsuarioPorFiltros(registroAcademico, nomeCompleto, userName, email) {
        // Exemplo útil para validação da recuperação de senha com os 4 campos do índice combinado
        try {
            const query = `?registro_academico=eq.${registroAcademico}&nome_completo=eq.${encodeURIComponent(nomeCompleto)}&user_name=eq.${userName}&email=eq.${email}`;
            const response = await fetch(`${VARIABLES_CONFIG.url}${VARIABLES_CONFIG.tabela_usuario}${query}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return [];
        }
    },

    // ==========================================
    // 4. LOGS DE AUDITORIA (SELECT, INSERT apenas)
    // ==========================================
    async registrarLog(registroAcademico, etapaAcesso, codigoDisciplina, statusCode, mensagem) {
        try {
            const payload = {
                registro_academico: registroAcademico,
                codigo_etapa_acesso: etapaAcesso,
                codigo_disciplina: codigoDisciplina || null,
                status_code: statusCode,
                mensagem_log: mensagem
            };

            const response = await fetch(`${VARIABLES_CONFIG.url}${VARIABLES_CONFIG.tabela_logs}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao registrar log de auditoria:', error);
        }
    }
};