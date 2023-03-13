import React from 'react';
import Draggable from 'react-draggable';
import moment from 'moment';

import { DataGrid } from '@material-ui/data-grid';
import { Close, InsertDriveFile, ListAlt, Receipt } from '@material-ui/icons';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
	Grow,
	IconButton,
	Tooltip,
	Typography,
	Paper,
} from '@material-ui/core/';

import nfeLogo from '../../../assets/svg/NFe.svg';

const ContasModal = (props) => {
	const whichContentShow = () => {
		if (props.type === 'Compra') {
			return (
				<>
					<div className='XAlign' style={{ justifyContent: 'space-between' }}>
						<div className='YAlign'>
							<Typography gutterBottom variant='subtitle1'>
								<strong>
									{props.Detalhes.Status === 'Faturado'
										? 'Emissão'
										: 'Solicitação'}
								</strong>
								:{' '}
								{typeof props.Detalhes.Data != 'undefined' &&
								props.Detalhes.Data != null
									? moment(props.Detalhes.Data).utc().format('L')
									: 'Desconhecido'}
							</Typography>
							<Typography gutterBottom variant='subtitle1'>
								<strong>Transportadora:</strong>{' '}
								{props.Detalhes.Transportadora === null
									? '?'
									: props.Detalhes.Transportadora}
							</Typography>
						</div>
						<Tooltip
							title={
								<label
									style={{
										fontSize: '14px',
										color: '#FFF',
										lineHeight: '20px',
									}}
								>
									Baixar Boleto
								</label>
							}
							placement='top'
							arrow
						>
							<IconButton
								disabled={props.Cooldown}
								onClick={() => props.onRequestBoleto(props.Detalhes)}
								color='primary'
							>
								<Receipt />
							</IconButton>
						</Tooltip>
						<Tooltip
							title={
								<label
									style={{
										fontSize: '14px',
										color: '#FFF',
										lineHeight: '20px',
									}}
								>
									Baixar NFe
								</label>
							}
							placement='top'
							arrow
						>
							<IconButton
								disabled={props.Cooldown}
								onClick={() => props.onRequestNFe(props.Detalhes.PedidoId)}
								color='primary'
							>
								<img src={nfeLogo} width='23px' height='23px' alt='NFe Icon' />
							</IconButton>
						</Tooltip>
					</div>
					<div style={{ height: 400, width: '100%' }}>
						<DataGrid
							rows={
								typeof props.Detalhes.Detalhes != 'undefined'
									? props.Detalhes.Detalhes
									: []
							}
							columns={columns}
							pageSize={5}
							hideFooter={props.Detalhes.Detalhes?.length > 5 ? false : true}
							disableSelectionOnClick={true}
							disableColumnMenu={true}
							loading={typeof props.Detalhes.Detalhes == 'undefined'}
						/>
					</div>
				</>
			);
		} else if (props.type === 'Royalties') {
			return (
				<>
					<div className='XAlign' style={{ justifyContent: 'flex-end' }}>
						<Tooltip
							title={
								<label
									style={{
										fontSize: '14px',
										color: '#FFF',
										lineHeight: '20px',
									}}
								>
									Baixar Boleto
								</label>
							}
							placement='top'
							arrow
						>
							<IconButton
								disabled={props.Cooldown}
								onClick={() => props.onRequestBoleto(props.Detalhes)}
								color='primary'
							>
								<InsertDriveFile />
							</IconButton>
						</Tooltip>
					</div>
					<div
						className='YAlign'
						style={{ height: 200, width: '100%', alignItems: 'center' }}
					>
						<Typography variant='h4'>Cobrança de Royalties</Typography>
						<Typography variant='subtitle1'>
							(15% sobre vendas anteriores ao mês referente)
						</Typography>
					</div>
				</>
			);
		} else if (props.type === '2BTech') {
			return (
				<>
					<div className='XAlign' style={{ justifyContent: 'flex-end' }}>
						<Tooltip
							title={
								<label
									style={{
										fontSize: '14px',
										color: '#FFF',
										lineHeight: '20px',
									}}
								>
									Baixar Boleto
								</label>
							}
							placement='top'
							arrow
						>
							<IconButton
								disabled={props.Cooldown}
								onClick={() => props.onRequestBoleto(props.Detalhes)}
								color='primary'
							>
								<InsertDriveFile />
							</IconButton>
						</Tooltip>
					</div>
					<div
						className='YAlign'
						style={{ height: 200, width: '100%', alignItems: 'center' }}
					>
						<Typography variant='h4'>Chamado 2BTech</Typography>
						<Typography variant='subtitle1'>
							(Cobrança de chamado técnico prestado pela empresa 2BTech não
							coberto pela franqueadora-GabrielB)
						</Typography>
					</div>
				</>
			);
		} else {
			return <></>;
		}
	};

	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			PaperComponent={PaperComponent}
			TransitionComponent={Transition}
			aria-labelledby='draggable-dialog-title'
		>
			<DialogTitle style={{ cursor: 'move' }} id='draggable-dialog-title'>
				<div
					className='XAlign'
					style={{ justifyContent: 'flex-start', alignItems: 'center' }}
				>
					<ListAlt />
					Detalhes do Pedido
				</div>
			</DialogTitle>
			<DialogContent>{whichContentShow()}</DialogContent>
			<DialogActions style={{ padding: '8px 24px' }}>
				<Button
					color='primary'
					onClick={() => props.onClose()}
					startIcon={<Close />}
				>
					Fechar
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ContasModal;

function PaperComponent(props) {
	return (
		<Draggable
			handle='#draggable-dialog-title'
			cancel={'[class*="MuiDialogContent-root"]'}
		>
			<Paper {...props} style={{ width: '100%', maxWidth: '900px' }} />
		</Draggable>
	);
}

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Grow {...props} />;
});

const columns = [
	{ field: 'id', headerName: 'Código', width: 100, editable: false },
	{
		field: 'Produto',
		headerName: 'Produto',
		flex: 1,
		editable: false,
	},
	{
		field: 'UN',
		headerName: 'Un',
		width: 50,
		editable: false,
		sortable: false,
	},
	{
		field: 'Quantidade',
		headerName: 'Quantidade',
		type: 'number',
		width: 125,
		editable: false,
	},
	{
		field: 'VlrUn',
		headerName: 'Valor Unitário',
		type: 'number',
		sortable: false,
		width: 130,
	},
	{
		field: 'VlrTotal',
		headerName: 'Valor Total',
		type: 'number',
		description: 'Cálculo do Valor Unitário x Quantidade',
		width: 130,
		valueGetter: (params) =>
			params.getValue(params.id, 'Quantidade') *
			params.getValue(params.id, 'VlrUn'),
	},
];
