// src/pages/Oportunidades.js - ATUALIZADO COM MODAL DE PAGAMENTO

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import SeletorDeLocalizacao from '../components/SeletorDeLocalizacao';
import HeaderEstiloTop from '../components/HeaderEstiloTop';
import ModalPagamentoPix from '../components/ModalPagamentoPix'; // ===== ALTERAÇÃO 1: Importar o Modal =====
import './Oportunidades.css';

// ======================= ALTERAÇÃO 2: Modificar o Card para controlar o Modal =======================
const CardOportunidadeBloqueado = ({ os }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAssinar = () => {
    setShowModal(true); // Ação do botão agora é apenas abrir o modal
  };

  return (
    <>
      {/* O Modal será renderizado aqui quando showModal for true */}
      {showModal && (
        <ModalPagamentoPix
          tipoPagamento="assinatura"
          valor={15.00} // Valor para a assinatura do trabalhador
          onClose={() => setShowModal(false)}
          onPaymentSuccess={() => {
            setShowModal(false);
            alert('Pagamento recebido! Assinatura ativada.');
          }}
        />
      )}

      {/* O card visual continua o mesmo */}
      <div className="card-oportunidade bloqueado">
        <div className="card-oportunidade-header">
          <h3>{os.titulo_servico}</h3>
          {os.valor_acordado && <span className="preco">R$ {os.valor_acordado}</span>}
        </div>
        <p className="habilidade-tag">{os.habilidade}</p>
        <p className="endereco">{`Serviço em ${os.endereco.cidade}`}</p>
        <p className="texto-bloqueado">Assine para ver os detalhes e aceitar trabalhos.</p>
        <button onClick={handleAssinar} className="btn btn-premium">
          Ativar Assinatura - Assine por 30 dias por (R$ 15,00)
        </button>
      </div>
    </>
  );
};
// ========================================================================================

const Oportunidades = () => {
  const { user, statusMonetizacao } = useAuth();
  const navigate = useNavigate();
  const [propostasDiretas, setPropostasDiretas] = useState([]);
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [modoBusca, setModoBusca] = useState(null);
  const [filtroHabilidade, setFiltroHabilidade] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [listaDeHabilidades, setListaDeHabilidades] = useState([]);
  const [perfilUsuario, setPerfilUsuario] = useState(null);

  useEffect(() => {
    if (statusMonetizacao.isLoading) {
      setIsLoading(true);
      return;
    }

    const buscarDadosIniciais = async () => {
      setIsLoading(true);
      const { data: habilidadesData } = await supabase.from('habilidades').select('nome').order('nome');
      if (habilidadesData) setListaDeHabilidades(habilidadesData);

      if (user) {
        const { data: perfilData, error: perfilError } = await supabase.from('perfis_completos').select('*').eq('id', user.id).single();
        if (perfilError) console.error("Erro ao buscar perfil:", perfilError);
        else setPerfilUsuario(perfilData);

        const { data: diretasData, error: diretasError } = await supabase.from('ordens_de_servico').select('*').eq('trabalhador_id', user.id).eq('status', 'pendente');
        if (diretasError) console.error("Erro ao buscar propostas diretas:", diretasError);
        else setPropostasDiretas(diretasData);
      }
      setIsLoading(false);
    };
    buscarDadosIniciais();
  }, [user, statusMonetizacao.isLoading]);

  const handleBuscaManual = async () => {
    setIsSearching(true);
    setModoBusca('manual');
    const params = {
      habilidades_param: filtroHabilidade ? [filtroHabilidade] : null,
      cidade_param: filtroCidade || null,
      data_param: filtroData || null
    };
    const { data, error } = await supabase.rpc('buscar_oportunidades', params);
    if (error) console.error("Erro na busca manual:", error);
    else setResultadosBusca(data || []);
    setIsSearching(false);
  };

  const handlePertoDeCasa = async () => {
    if (!perfilUsuario) return;
    setIsSearching(true);
    setModoBusca('perto_de_casa');
    setFiltroEstado(perfilUsuario.endereco.estado || '');
    setFiltroCidade(perfilUsuario.endereco.cidade || '');
    const { data, error } = await supabase.rpc('buscar_oportunidades_agrupadas', {
      habilidades_usuario: perfilUsuario.habilidades,
      bairro_usuario: perfilUsuario.endereco.bairro,
      cidade_usuario: perfilUsuario.endereco.cidade,
    });
    if (error) console.error("Erro na busca 'Perto de Casa':", error);
    else setResultadosBusca(data || []);
    setIsSearching(false);
  };

  const handleLimparFiltros = () => {
    setFiltroHabilidade('');
    setFiltroEstado('');
    setFiltroCidade('');
    setFiltroData('');
    setResultadosBusca([]);
    setModoBusca(null);
  };

  const renderResultados = () => {
    if (isSearching) return <p>Buscando...</p>;
    if (!modoBusca) return <p>Use os filtros ou o botão "Perto de Casa" para encontrar oportunidades.</p>;
    if (!resultadosBusca || resultadosBusca.length === 0) return <p>Nenhuma oportunidade encontrada com os critérios selecionados.</p>;

    const podeAceitar = statusMonetizacao.podeAceitarTrabalho;

    const renderCard = (os) => {
      if (podeAceitar) {
        return <CardOportunidade key={os.id} os={os} />;
      } else {
        return <CardOportunidadeBloqueado key={os.id} os={os} />;
      }
    };

    if (modoBusca === 'perto_de_casa') {
      return resultadosBusca.map(grupo => (
        <div key={grupo.habilidade} className="grupo-habilidade">
          <h4>Oportunidades como {grupo.habilidade}</h4>
          {grupo.oportunidades.map(os => renderCard(os))}
        </div>
      ));
    }

    if (modoBusca === 'manual') {
      return resultadosBusca.map(os => renderCard(os));
    }
  };

  if (isLoading) {
    return (
        <>
            <HeaderEstiloTop showUserActions={false} />
            <div className="oportunidades-container"><p>Carregando...</p></div>
        </>
    );
  }

  return (
    <>
      <HeaderEstiloTop showUserActions={false} />
      <div className="oportunidades-container">
        <h1 className="titulo-pagina">Oportunidades</h1>
        <section className="secao-propostas-diretas">
          <h2>Propostas Diretas para Você</h2>
          {propostasDiretas.length > 0 ? (
            <div className="carrossel-diretas">
              {propostasDiretas.map(os => (
                <div key={os.id} className="card-direta" onClick={() => navigate(`/os/${os.id}`)}>
                  <h3>{os.titulo_servico}</h3>
                  <p>Clique para ver os detalhes</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Você não tem nenhuma proposta direta no momento.</p>
          )}
        </section>
        <section className="secao-busca">
          <h2>Explorar Ofertas Públicas</h2>
          <div className="filtros-container">
            <div className="filtro-item">
              <label htmlFor="filtro-habilidade">Habilidade</label>
              <select id="filtro-habilidade" value={filtroHabilidade} onChange={(e) => setFiltroHabilidade(e.target.value)} disabled={modoBusca === 'perto_de_casa'} className="form-input">
                {modoBusca === 'perto_de_casa' ? (<option>Todas as suas habilidades</option>) : (<><option value="">Qualquer Habilidade</option>{listaDeHabilidades.map(h => <option key={h.nome} value={h.nome}>{h.nome}</option>)}</>)}
              </select>
            </div>
            <div className="filtro-item">
              <label>Local</label>
              <SeletorDeLocalizacao estadoInicial={filtroEstado} cidadeInicial={filtroCidade} onEstadoChange={setFiltroEstado} onCidadeChange={setFiltroCidade} />
            </div>
            <div className="filtro-item">
              <label htmlFor="filtro-data">A partir da Data</label>
              <input id="filtro-data" type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className="form-input" />
            </div>
          </div>
          <div className="botoes-busca-container">
            <button className="btn-buscar" onClick={handleBuscaManual}>Buscar</button>
            <button className="btn-limpar-filtros" onClick={handleLimparFiltros}>Limpar Filtros</button>
            <button className="btn-perto-de-mim" onClick={handlePertoDeCasa} disabled={!perfilUsuario}>Perto de Casa</button>
          </div>
        </section>
        <main className="secao-resultados">
          <h3>Resultados</h3>
          <div className="lista-oportunidades">
            {renderResultados()}
          </div>
        </main>
      </div>
    </>
  );
};

const CardOportunidade = ({ os }) => {
  const navigate = useNavigate();
  return (
    <div className="card-oportunidade">
      <div className="card-oportunidade-header">
        <h3>{os.titulo_servico}</h3>
        {os.valor_acordado && <span className="preco">R$ {os.valor_acordado}</span>}
      </div>
      <p className="habilidade-tag">{os.habilidade}</p>
      <p className="endereco">{`${os.endereco.bairro}, ${os.endereco.cidade} - ${os.endereco.estado}`}</p>
      <button onClick={() => navigate(`/os/${os.id}`)} className="btn-ver-detalhes">Ver Detalhes</button>
    </div>
  );
};
export default Oportunidades;
