import React, { useEffect } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles, makeStyles } from "@material-ui/core/styles";
import { ViewList } from "@material-ui/icons";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";

import { Table } from "../../components/table";
import Select from "../../components/materialComponents/Select";
import InputMultline from "../../components/materialComponents/InputMultline";

import {
  SetCheckedProd,
  ChangeCliente,
  ChangeTipoVenda,
  SetCondPag,
  SetDepOrigem,
  SetDepDestino,
  SetObs,
} from "../../global/actions/VendasAction";

function Vender(props) {
  const classes = useStyles();
  const {
    Produtos,
    Checked,
    Clientes,
    Cliente,
    TipoVenda,
    Condicoes,
    OBS,
    CondPag,
    RemOrigem,
    RemDestino,
    Depositos,
  } = props.State;
  const {
    SetCheckedProd,
    ChangeCliente,
    ChangeTipoVenda,
    SetObs,
    SetCondPag,
    SetDepOrigem,
    SetDepDestino,
  } = props;

  const handleToggle = (value) => () => {
    SetCheckedProd(value.ProdId[0]);
  };

  const handleSwitchCliente = (CNPJ) => {
    Clientes.forEach((cliente) =>
      String(cliente.CNPJ) === String(CNPJ) ? ChangeCliente(cliente) : null
    );
  };

  const customList = (title, items) => (
    <Card style={{ width: "100%" }}>
        <Select
          onChange={(e) => handleSwitchCliente(e.target.value)}
          value={Cliente.CNPJ}
          disabled={false}
          label="Cliente"
          width="100%"
        >
          {Clientes.map((cliente) => (
            <MenuItem value={cliente.CNPJ} key={cliente.CNPJ}>
              {cliente.Nome_Fantasia}, {cliente.CNPJss}
            </MenuItem>
          ))}
        </Select>

        <Select
          onChange={(e) => ChangeTipoVenda(e.target.value)}
          value={TipoVenda}
          disabled={false}
          label="Tipo de Venda"
          width="100%"
          MTop='8px'
        >
          <MenuItem value="Venda" key="Venda">
            Venda
          </MenuItem>
          <MenuItem value="Remessa" key="Remessa">
            Remessa
          </MenuItem>
          <MenuItem value="Bonificação" key="Bonificação">
            Bonificação
          </MenuItem>
        </Select>
      {extraOptions(
        TipoVenda,
        Condicoes,
        CondPag,
        Depositos,
        RemOrigem,
        RemDestino,
        SetCondPag,
        SetDepOrigem,
        SetDepDestino
      )}

      <InputMultline
        onChange={(e) => SetObs(e.target.value)}
        value={OBS}
        label="Obs. na nota"
        style={{ width: "100%", marginTop: "8px" }}
      />

      <CardHeader
        className={classes.cardHeader}
        avatar={<ViewList />}
        title={title}
        subheader={`${ProdutosMarcados(Produtos, Checked)}/${
          items.length
        } selecionados`}
      />
      <Divider />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell></StyledTableCell>
              <StyledTableCell>Código</StyledTableCell>
              <StyledTableCell>Produto</StyledTableCell>
              <StyledTableCell>Valor Base</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((prod, i) => {
              const labelId = `transfer-list-all-item-${prod.ProdId[0]}-label`;

              return (
                <StyledTableRow
                  key={prod.ProdId[0]}
                  onClick={handleToggle(prod)}
                >
                  <StyledTableCell>
                    <input
                      style={{ margin: "0px" }}
                      checked={Checked.indexOf(prod.ProdId[0]) !== -1}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                      type="checkbox"
                      value={prod.ProdId[0]}
                    />
                  </StyledTableCell>

                  <StyledTableCell>{prod.ProdId[0]}</StyledTableCell>

                  <StyledTableCell>
                    <ListItemText primary={String(prod.Produto).trim()} />
                  </StyledTableCell>
                  <StyledTableCell>
                    <ListItemText
                      primary={Number.parseFloat(prod.PvnVlr).toFixed(4)}
                    />
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );

  return (
    <div
      className="XAlign"
      style={{
        width: "100%",
        height: "100%",
        flexWrap: "wrap !important",
        alignItems: "flex-start",
      }}
    >
      {customList("Produtos", Produtos)}
    </div>
  );
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      SetCheckedProd,
      ChangeCliente,
      ChangeTipoVenda,
      SetObs,
      SetCondPag,
      SetDepOrigem,
      SetDepDestino,
    },
    dispatch
  );

const mapStateToProps = (store) => ({
  State: store.VendaState,
});

export default connect(mapStateToProps, mapDispatchToProps)(Vender);

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

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "auto",
    width: "100%",
    height: "100%",
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    overflow: "auto",
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
}));

const ProdutosMarcados = (ProdList, Marcados) => {
  let count = 0;
  ProdList.forEach((prod) =>
    Marcados.indexOf(prod.ProdId[0]) !== -1 ? count++ : null
  );

  return count;
};

const extraOptions = (
  TipoVenda,
  Condicoes = [],
  Pag,
  Depositos,
  depOrigem,
  depDestino,
  SetCondPag,
  SetDepOrigem,
  SetDepDestino
) => {
  switch (TipoVenda) {
    case "Venda":
      return (
        <Select
          onChange={(e) => SetCondPag(e.target.value)}
          value={Pag}
          disabled={false}
          label="Condição de Pagamento"
          width="100%"
          MTop="8px"
        >
          {Condicoes.map((cond) => (
            <MenuItem value={cond.CpgId} key={cond.CpgId}>
              {cond.CpgDesc}
              {/* {cond.CpgDesc}, ({addBusinessDays(moment(), cond.CpgId)}) */}
            </MenuItem>
          ))}
        </Select>
      );
    case "Remessa":
      return (
        <>
          <Select
            onChange={(e) => SetDepOrigem(e.target.value)}
            value={depOrigem}
            disabled={false}
            label="Origem"
            width="100%"
            MTop="8px"
          >
            {Depositos.map((dep) => (
              <MenuItem value={dep.DepId} key={dep.DepId}>
                {dep.DepNome}
              </MenuItem>
            ))}
          </Select>
          <Select
            onChange={(e) => SetDepDestino(e.target.value)}
            value={depDestino}
            disabled={false}
            label="Destino"
            width="100%"
            MTop="8px"
          >
            {Depositos.map((dep) => (
              <MenuItem value={dep.DepId} key={dep.DepId}>
                {dep.DepNome}
              </MenuItem>
            ))}
          </Select>
        </>
      );
    case "Bonificação":
      return;
    default:
      return;
  }
};

function addBusinessDays(originalDate, numDaysToAdd) {
  const Sunday = 0;
  const Saturday = 6;
  let daysRemaining = numDaysToAdd;

  const newDate = originalDate.clone();

  while (daysRemaining > 0) {
    newDate.add(1, "days");
    if (newDate.day() !== Sunday && newDate.day() !== Saturday) {
      daysRemaining--;
    }
  }

  return newDate.format("ll");
}