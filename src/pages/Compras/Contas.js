import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";

//Meio de comunicação
import { api } from "../../services/api";
//"Placeholder" da página enquanto dados são carregados no
import Loading from "../../components/loading_screen";

//import de elementos visuais
import { Toast } from "../../components/toasty";
import {
  ChangeTab,
  SetMin,
  SetRetira,
} from "../../global/actions/ComprasAction";

import { DataGrid } from "@material-ui/data-grid";
import { withStyles } from "@material-ui/core/styles";
import Grow from "@material-ui/core/Grow";
import { Close, Block } from "@material-ui/icons";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Draggable from "react-draggable";

import { Table } from "../../components/table";

function Contas(props) {
  const TabIndex = 1;

  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ResumoCompras, setResumo] = useState([]);
  const [Duplicatas, setDuplicatas] = useState([]);
  const [TotalDuplicatas, setTotalDuplicatas] = useState([]);
  const [TotalAno, setTotalAno] = useState([]);
  const [pedidoDet, setPedidoDet] = useState({});

  const { ChangeTab, SetMin, SetRetira } = props;

  //component did mount
  useEffect(() => {
    async function loadProdutos() {
      try {
        ChangeTab(TabIndex);

        const response = await api.get("/compras/contas");
        setResumo(response.data.Geral);
        setDuplicatas(response.data.Duplicatas);
        setTotalDuplicatas(DefineTotalDuplicatas(response.data.Duplicatas));
        setTotalAno(response.data.ComprasAno[0]);
        setLoaded(true);
        SetMin(response.data.Geral.VlrMinCompra);
        SetRetira(response.data.Geral.Retira);
      } catch (err) {
        Toast("Falha ao recuperar dados", "error");
      }
    }
    loadProdutos();
  }, [ChangeTab, SetMin, SetRetira]);

  const handleLoadDet = async (DOC) => {
    setOpen(true);
    try {
      const response = await api.get(
        `/compras/pedidos/detalhes/${DOC}/DOC`
      );
      setPedidoDet(response.data);
    } catch (err) {
      setPedidoDet({});
      Toast("Não foi possivel recuperar os detalhes desse pedido", "error");
    }
  };

  const handleCloseDialog = () => {
    setPedidoDet({});
    setOpen(false);
  };

  return !loaded ? (
    <Loading />
  ) : (
    <div
      className="XAlign"
      style={{
        width: "100%",
        height: "100%",
        flexWrap: "wrap !important",
        alignItems: "flex-start",
      }}
    >
      <Dialog
        open={open}
        onClose={() => handleCloseDialog()}
        PaperComponent={PaperComponent}
        TransitionComponent={Transition}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          Detalhes do Pedido
        </DialogTitle>
        <DialogContent>
          <div className="XAlign" style={{ justifyContent: "space-between" }}>
            <Typography gutterBottom variant="subtitle1">
              <strong>
                {pedidoDet.Status === "Faturado" ? "Emissão" : "Solicitação"}
              </strong>
              :{" "}
              {typeof pedidoDet.Data != "undefined"
                ? moment(pedidoDet.Data).format("L")
                : ""}
            </Typography>
            <Typography gutterBottom variant="subtitle1">
              <strong>Transportadora:</strong>{" "}
              {pedidoDet.Transportadora === null
                ? "?"
                : pedidoDet.Transportadora}
            </Typography>
          </div>
          <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={
                  typeof pedidoDet.Detalhes != "undefined"
                    ? pedidoDet.Detalhes
                    : []
                }
                columns={columns}
                autoPageSize
                disableSelectionOnClick
                disableColumnMenu
                loading={typeof pedidoDet.Detalhes == "undefined"}
              />
          </div>
        </DialogContent>
        <DialogActions>
          {pedidoDet.Status === "Processando" ? (
            <Button
              color="primary"
              onClick={() => alert("Cancelamento em desenvolvimento")}
              startIcon={<Block />}
            >
              Cancelar Pedido
            </Button>
          ) : null}

          <Button
            color="primary"
            onClick={handleCloseDialog}
            startIcon={<Close />}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h6">Total Mensal</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell>Jan</StyledTableCell>
              <StyledTableCell>Fev</StyledTableCell>
              <StyledTableCell>Mar</StyledTableCell>
              <StyledTableCell>Abr</StyledTableCell>
              <StyledTableCell>Mai</StyledTableCell>
              <StyledTableCell>Jun</StyledTableCell>
              <StyledTableCell>Jul</StyledTableCell>
              <StyledTableCell>Ago</StyledTableCell>
              <StyledTableCell>Set</StyledTableCell>
              <StyledTableCell>Out</StyledTableCell>
              <StyledTableCell>Nov</StyledTableCell>
              <StyledTableCell>Dez</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["1"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["2"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["3"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["4"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["5"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["6"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["7"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["8"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["9"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["10"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["11"])}
              </StyledTableCell>
              <StyledTableCell>
                {TotalAno && currencyFormat(TotalAno["12"])}
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Typography variant="h6">Duplicatas</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>NF</StyledTableCell>
                  <StyledTableCell>Parcela</StyledTableCell>
                  <StyledTableCell>Tipo</StyledTableCell>
                  <StyledTableCell>Descrição</StyledTableCell>
                  <StyledTableCell>Emissão</StyledTableCell>
                  <StyledTableCell>Vencimento</StyledTableCell>
                  <StyledTableCell>Valor</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Duplicatas.map((dup) => {
                  return (
                    <StyledTableRow
                      style={{
                        background:
                          moment(dup.DtVenc) < moment() ? "#ff4747" : null,
                      }}
                      key={dup.E1_NUM}
                      onClick={() => handleLoadDet(dup.E1_NUM)}
                    >
                      <StyledTableCell>{dup.E1_NUM}</StyledTableCell>
                      <StyledTableCell>
                        {String(dup.E1_PARCELA).trim() === ""
                          ? 1
                          : dup.E1_PARCELA}
                      </StyledTableCell>
                      <StyledTableCell>{dup.E1Desc}</StyledTableCell>
                      <StyledTableCell>{dup.E1_TIPO[0]}</StyledTableCell>
                      <StyledTableCell>
                        {moment(dup.DtEmissao).format("L")}
                      </StyledTableCell>
                      <StyledTableCell>
                        {moment(dup.DtVenc).format("L")}
                      </StyledTableCell>
                      <StyledTableCell>
                        {currencyFormat(dup.E1_VALOR)}
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div>
          <Typography variant="h6">Balanço</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Bloqueado</StyledTableCell>
                  <StyledTableCell>Limite</StyledTableCell>
                  <StyledTableCell>Limite Extra</StyledTableCell>
                  <StyledTableCell>Compras</StyledTableCell>
                  <StyledTableCell>Saldo</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell
                    style={{
                      background:
                        ResumoCompras.Bloqueado === "S" ? "#ff4747" : null,
                    }}
                  >
                    {ResumoCompras.Bloqueado === "S" ? "Sim" : 'Não'}
                  </StyledTableCell>
                  <StyledTableCell>
                    {currencyFormat(ResumoCompras.LimiteCredito)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {currencyFormat(ResumoCompras.LimExtraCredito)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {currencyFormat(ResumoCompras.Compras)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {currencyFormat(ResumoCompras.LimiteAtual)}
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Tipo</StyledTableCell>
                  <StyledTableCell>Vencida</StyledTableCell>
                  <StyledTableCell>A Vencer</StyledTableCell>
                  <StyledTableCell>Total</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TotalDuplicatas.map((total) => (
                  <StyledTableRow>
                    <StyledTableCell>{total.E1_TIPO}</StyledTableCell>
                    <StyledTableCell
                      style={{
                        background:
                          currencyFormat(total.vencido) > 0 ? "#ff4747" : null,
                      }}
                    >
                      {currencyFormat(total.vencido)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {currencyFormat(total.avencer)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {currencyFormat(total.vencido + total.avencer)}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (store) => ({
  State: store.CompraState,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ChangeTab,
      SetMin,
      SetRetira,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Contas);

//estilo célula
const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

//estilo linha
const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },

    "&:hover": {
      transition: "150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
      backgroundColor: "#CCC",
      cursor: "pointer",
    },
  },
}))(TableRow);

const DefineTotalDuplicatas = (duplicatas = []) => {
  let aux = [];
  let cont = true;
  const hoje = moment();

  duplicatas.forEach((dup) => {
    for (let i = 0; i < aux.length; i++) {
      if (dup.E1_TIPO[0] === aux[i].E1_TIPO) {
        if (moment(dup.DtVenc) >= hoje) {
          aux[i].avencer += dup.E1_VALOR;
        } else {
          aux[i].vencido += dup.E1_VALOR;
        }
        cont = false;
        break;
      }
    }

    if (cont) {
      aux.push({
        E1_TIPO: dup.E1_TIPO[0],
        avencer: moment(dup.DtVenc) >= hoje ? dup.E1_VALOR : 0,
        vencido: moment(dup.DtVenc) < hoje ? dup.E1_VALOR : 0,
      });
    }
    cont = true;
  });

  return aux;
};

const currencyFormat = (currency) => {
  if (
    currency !== null &&
    String(currency).trim() !== "" &&
    typeof currency != "undefined"
  ) {
    return String(Number.parseFloat(currency).toFixed(2)).replace('.', ',');
  } else {
    return "0,00";
  }
};

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} style={{ width: "100%", maxWidth: "900px" }} />
    </Draggable>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow {...props} />;
});

const columns = [
  { field: "id", headerName: "Código", width: 100, editable: false },
  {
    field: "Produto",
    headerName: "Produto",
    flex: 1,
    editable: false,
  },
  {
    field: "UN",
    headerName: "Un",
    width: 50,
    editable: false,
    sortable: false,
  },
  {
    field: "Quantidade",
    headerName: "Quantidade",
    type: "number",
    width: 125,
    editable: false,
  },
  {
    field: "VlrUn",
    headerName: "Valor Unitário",
    type: "number",
    sortable: false,
    width: 130,
  },
  {
    field: "VlrTotal",
    headerName: "Valor Total",
    type: "number",
    description: "Cálculo do Valor Unitário x Quantidade",
    width: 130,
    valueGetter: (params) =>
      params.getValue(params.id, "Quantidade") *
      params.getValue(params.id, "VlrUn"),
  },
];