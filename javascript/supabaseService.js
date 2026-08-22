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

            if (!response.ok) {
                const erroServidor = await response.json();
                return { error: erroServidor };
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            return { error: { message: error.message } };
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
    // 4. LOGS DE AUDITORIA (Com rastreio de Erros)
    // ==========================================
    async registrarLog(registroAcademico, etapaAcesso, codigoDisciplina, statusCode, mensagem) {
        try {
            // 1. Consulta o status da etapa atual
            const checkResponse = await fetch(`${VARIABLES_CONFIG.url}${VARIABLES_CONFIG.tabela_parametros}?codigo_etapa_acesso=eq.${etapaAcesso}&select=status`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const parametros = await checkResponse.json();

            // 2. Verifica se a etapa está desativada
            if (parametros && parametros.length > 0) {
                if (parametros[0].status === false) {
                    console.log(`Gravação ignorada: A etapa '${etapaAcesso}' está com status FALSE.`);
                    return null;
                }
            } else {
                console.warn(`Atenção: A etapa '${etapaAcesso}' não existe na tabela 'parametros_sistema'. O Supabase vai bloquear a chave estrangeira!`);
            }

            // 3. Monta o pacote e grava
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
            
            // 4. INTERCEPTADOR DE ERROS (AQUI É ONDE VAMOS DESCOBRIR O PROBLEMA)
            if (!response.ok) {
                const erroDB = await response.json();
                console.error(`❌ O Supabase bloqueou o log [${etapaAcesso}]. Motivo:`, erroDB);
                return null;
            }

            console.log(`✅ Log [${etapaAcesso}] gravado com sucesso!`);
            return await response.json();
            
        } catch (error) {
            console.error('Erro catastrófico ao registrar log:', error);
        }
    }
};