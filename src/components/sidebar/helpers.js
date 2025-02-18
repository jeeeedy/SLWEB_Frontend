import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';

import { Tooltip, Typography, IconButton } from '@material-ui/core';
import {
	LocalAtm as LocalAtmIcon,
	LocalShipping as LocalShippingIcon,
	Lock as LockIcon,
	DepartureBoard as DepartureBoardIcon,
} from '@material-ui/icons';

export const Helpers = () => {
	const [faturamento, setFaturamento] = useState(null);
	const [blocks, setBlocks] = useState({});

	let path = useLocation().pathname;

	const loadComprasData = async () => {
		try {
			const response = await api.get(`/compras/faturamento/rotas/WYSI`);

			setFaturamento(response.data.Faturamento);
		} catch (err) {
			setFaturamento(null);
		}
	};

	const loadMainData = async () => {
		try {
			const response = await api.get(`/any/block/info`);

			setBlocks(response.data);
		} catch (err) {
			setBlocks({});
		}
	};

	useEffect(() => {
		if (path === '/compras') {
			loadComprasData();
		}

		loadMainData();
	}, [path]);

	useEffect(() => {
		if (blocks.Deliver && blocks.Deliver.length > 0) {
			alert(
				`Por favor, confirme o recebimento da(s) solicitação(ões) N ${blocks.Deliver.map(
					(os) => os.OSCId
				)}, caso ainda não tenha recebido a(s) solicitação(ões) entre em contato com o SAF.`
			);
		}
	}, [blocks]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'flex-end',
				width: '100%',
				padding: '0px 32px 0px 0px',
			}}
		>
			{pathContentToShow(path, faturamento)}
			{fixedContentToShow(blocks)}
		</div>
	);
};

const pathContentToShow = (path, faturamento) => {
	switch (path) {
		case '/compras':
			return (
				<>
					<Tooltip
						title={
							faturamento === null ? (
								<div
									style={{
										fontSize: '14px',
										color: '#FFF',
										lineHeight: '20px',
									}}
								>
									{' '}
									<Typography color='inherit'>
										Previsões para CEP padrão
									</Typography>{' '}
									<Typography color='inherit'>Carregando...</Typography>{' '}
								</div>
							) : (
								<div
									style={{
										fontSize: '14px',
										color: '#FFF',
										lineHeight: '20px',
									}}
								>
									{' '}
									<Typography color='inherit'>
										Previsões para CEP: <strong>{faturamento.CEP}</strong>
									</Typography>{' '}
									<em>Faturamento previsto: </em>{' '}
									<u>
										{faturamento.PrevFaturamento}({faturamento.Faturamento})
									</u>
									. <br /> <em>Rota prevista: </em>{' '}
									<u>
										{faturamento.PrevRota}({faturamento.Rota})
									</u>
									.{' '}
								</div>
							)
						}
						placement='bottom'
						arrow={true}
					>
						<IconButton color='default'>
							<LocalShippingIcon fontSize='large' />
						</IconButton>
					</Tooltip>
					<Tooltip
						title={
							<label
								style={{ fontSize: '14px', color: '#FFF', lineHeight: '20px' }}
							>
								{' '}
								PIX Pilão Professional
								<br /> Banco Santander
								<br /> Tipo de chave: CNPJ
								<br /> Chave: 08.941.325/0001-80{' '}
							</label>
						}
						placement='bottom'
						arrow={true}
					>
						<IconButton color='default'>
							<LocalAtmIcon fontSize='large' />
						</IconButton>
					</Tooltip>
				</>
			);
		default:
			return null;
	}
};

const fixedContentToShow = (blocks) => {
	let returnableIcons = [];

	if (blocks.Equip) {
		returnableIcons.push(
			<>
				<Tooltip
					title={
						<div
							style={{ fontSize: '14px', color: '#FFF', lineHeight: '20px' }}
						>
							Algumas opções do sistema estão bloqueadas porque a localização
							das máquinas não foi informada no periodo devido.
						</div>
					}
					placement='bottom'
					arrow={true}
				>
					<IconButton color='default'>
						<LockIcon fontSize='large' />
					</IconButton>
				</Tooltip>
			</>
		);
	}

	if (blocks.Deliver && blocks.Deliver.length > 0) {
		returnableIcons.push(
			<>
				<Tooltip
					title={
						<div
							style={{ fontSize: '14px', color: '#FFF', lineHeight: '20px' }}
						>
							Você tem uma ou mais Solicitações de máquina aguardando a
							confirmação de entrega.
							<p>
								Acesse a <strong>tela "Solicitação"</strong> {'>'} na{' '}
								<strong>aba "Solicitações"</strong> {'>'} confirme o recebimento
								através do botão <strong>"Gerenciar"</strong>{' '}
							</p>
						</div>
					}
					placement='bottom'
					arrow={true}
				>
					<IconButton color='default'>
						<DepartureBoardIcon fontSize='large' />
					</IconButton>
				</Tooltip>
			</>
		);
	}

	return returnableIcons;
};
