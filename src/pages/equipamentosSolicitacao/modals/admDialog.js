import React, { useState } from "react";
import { api } from "../../../services/api";
import Draggable from "react-draggable";
import { TextInput } from "react-materialize";

import Button from "../../../components/materialComponents/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";
import Settings from "@material-ui/icons/Settings";
import Check from "@material-ui/icons/Check";
import Close from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";

import { roleLevel, convertData } from "../../../misc/commom_functions";
import {
  REACT_APP_SISTEMA_ROLE_LEVEL,
  REACT_APP_BACKOFFICE_ROLE_LEVEL,
  REACT_APP_TECNICA_ROLE_LEVEL,
  REACT_APP_EXPEDICAO_ROLE_LEVEL,
  REACT_APP_FRANQUEADO_ROLE_LEVEL,
} from "../../../misc/role_levels";
import { Toast } from "../../../components/toasty";
import { RED_SECONDARY, GREY_SECONDARY } from "../../../misc/colors";
import DatePicker from "../../../components/materialComponents/datePicker";

function PaperComponent(props) {
  return (
    <Draggable
      {...props}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}
function DraggableDialog(props) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(null);
  const [rejectReason, setReject] = useState("");
  const [prevDate, setPrev] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [wait, setWait] = useState(false);

  const { Req } = props;

  const handleClickOpen = async () => {
    setStage(CheckStage(Req));
    setOpen(true);
    try {
      await api.put("/equip/requests/check", {
        ID: Req.OSCId,
      });
    } catch (err) {}
  };

  const handleClose = () => {
    setOpen(false);
    setReject("");
    setPrev(null);
  };

  const handleManagement = async (action) => {
    setWait(true);
    let toastId = null

    try {
      toastId = Toast('Aguarde...', 'wait')
      const response = await api.put("/equip/requests/validate", {
        OSID: Req.OSCId,
        action: action,
        reject: rejectReason,
        prev: prevDate,
      });

      Toast('Atualização gravada', 'update', toastId, 'success')
      setUpdated(true);
      handleClose();
    } catch (err) {
      setWait(false);
    }
  };

  const updateDate = (date) => {
    date instanceof Date && !isNaN(date) ? setPrev(date) : setPrev(null);
  };

  const SUDO = async (action) => {
    setWait(true);
    let toastId = null

    try {
      toastId = Toast('Aguarde...', 'wait')
      await api.put("/equip/requests/admin", {
        OSID: Req.OSCId,
        action,
      });

      Toast('Atualização gravada com sucesso!', 'update', toastId, 'success')
      setWait(false);
    } catch (err) {
      setWait(false);
      Toast('Falha ao gravar atualização', 'update', toastId, 'error')
    }
  };

  return (
    <div>
      <Button
        disabled={updated}
        style={{
          color: `${updated ? "#CCCCCC" : RED_SECONDARY}`,
          border: `1px solid ${updated ? "#CCCCCC" : RED_SECONDARY}`,
        }}
        variant="outlined"
        color="primary"
        onClick={handleClickOpen}
      >
        <Settings />
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          GERENCIAMENTO DE SOLICITAÇÃO
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Status: </strong>
            {showStatus(stage)}
          </DialogContentText>
          {ShowControlls(
            stage,
            Req,
            rejectReason,
            setReject,
            prevDate,
            updateDate,
            handleManagement,
            wait,
            SUDO
          )}
        </DialogContent>
        <DialogActions style={{ padding: '8px 24px'}}>
          <Button
            style={{
              color: `${wait ? "#CCCCCC" : RED_SECONDARY}`,
              border: `1px solid ${wait ? "#CCCCCC" : RED_SECONDARY}`,
            }}
            disabled={wait}
            onClick={handleClose}
            color="primary"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DraggableDialog;

const CheckStage = (requisicao) => {
  if (requisicao.OSCStatus === "Concluido") {
    //pedido concluido
    return 0;
  } else if (
    requisicao.OSCComDtValidação === null &&
    requisicao.OSCStatus === "Ativo"
  ) {
    //aguardando aprovação comercial
    return 1;
  } else if (
    requisicao.OSCComDtValidação !== null &&
    requisicao.OSCComAceite === false
  ) {
    //negado pelo comercial
    return -1;
  } else if (
    requisicao.OSCTecDtValidação === null &&
    requisicao.OSCStatus === "Ativo"
  ) {
    //aguardando aprovação técnica
    return 2;
  } else if (
    requisicao.OSCTecDtValidação !== null &&
    requisicao.OSCTecAceite === false
  ) {
    //negado pela técnica
    return -2;
  } else if (
    requisicao.OSCExpDtPrevisao === null &&
    requisicao.OSCStatus === "Ativo"
  ) {
    //aguardando previsão de entrega da expedição
    return 3;
  } else if (
    requisicao.OSCExpDtPrevisao !== null &&
    requisicao.OSCStatus === "Ativo"
  ) {
    //aguardando previsão de entrega da expedição
    return -3;
  } else if (requisicao.OSCStatus === "Cancelado") {
    //pedido cancelado pelo usuário
    return 4;
  } else {
    //só Deus sabe quando vai cair aqui, provavelmente se mecherem manualmente na OSCtrl
    return 9;
  }
};

const ShowControlls = (
  stage,
  Req,
  rejectReason,
  setReject,
  prevDate,
  updateDate,
  handleManagement,
  wait,
  SUDO
) => {
  if (roleLevel() === REACT_APP_SISTEMA_ROLE_LEVEL) {
    //Superuser
    return (
      <div
        className="XAlign"
        style={{
          justifyContent: "space-between",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <div className="YAlign" style={{ width: "100%", marginRight: "8px" }}>
          <Button
            disabled={wait}
            style={{
              backgroundColor: wait ? "#CCC" : GREY_SECONDARY,
              color: "#FFFFFF",
              borderBottom: "8px",
              width: "100%",
              marginBottom: "8px",
              whiteSpace: "nowrap",
            }}
            onClick={() => SUDO("RC")}
          >
            Remover Comercial
          </Button>
          <Button
            disabled={wait}
            style={{
              backgroundColor: wait ? "#CCC" : GREY_SECONDARY,
              color: "#FFFFFF",
              borderBottom: "8px",
              width: "100%",
              marginBottom: "8px",
              whiteSpace: "nowrap",
            }}
            onClick={() => SUDO("RT")}
          >
            Remover Técnica
          </Button>
          <Button
            disabled={wait}
            style={{
              backgroundColor: wait ? "#CCC" : GREY_SECONDARY,
              color: "#FFFFFF",
              borderBottom: "8px",
              width: "100%",
              marginBottom: "8px",
              whiteSpace: "nowrap",
            }}
            onClick={() => SUDO("RE")}
          >
            Remover Expedição
          </Button>
        </div>
        <div className="YAlign" style={{ width: "100%" }}>
          <Button
            disabled={wait}
            style={{
              backgroundColor: wait ? "#CCC" : GREY_SECONDARY,
              color: "#FFFFFF",
              borderBottom: "8px",
              width: "100%",
              marginBottom: "8px",
              whiteSpace: "nowrap",
            }}
            onClick={() => SUDO("Cancelar")}
          >
            Cancelar OS
          </Button>
          <Button
            disabled={wait}
            style={{
              backgroundColor: wait ? "#CCC" : GREY_SECONDARY,
              color: "#FFFFFF",
              borderBottom: "8px",
              width: "100%",
              marginBottom: "8px",
              whiteSpace: "nowrap",
            }}
            onClick={() => SUDO("Concluir")}
          >
            Concluir OS
          </Button>
          <Button
            disabled={wait}
            style={{
              backgroundColor: wait ? "#CCC" : GREY_SECONDARY,
              color: "#FFFFFF",
              borderBottom: "8px",
              width: "100%",
              marginBottom: "8px",
              whiteSpace: "nowrap",
            }}
            onClick={() => SUDO("Ativar")}
          >
            Ativar OS
          </Button>
        </div>
      </div>
    );
  } else if (stage === 4 || stage === 0) {
    //Qualquer um
    return (
      <Typography>
        Não é possivel gerenciar uma solicitação que já foi{" "}
        <strong>Cancelada</strong> ou <strong>Concluída.</strong>
      </Typography>
    );
  } else if (roleLevel() === REACT_APP_FRANQUEADO_ROLE_LEVEL) {
    //Franqueado
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div
          className="YAlign"
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Button
            disabled={wait}
            style={{
              margin: "0px 0px 8px 0px",
              width: "100%",
              border: "1px solid #000",
            }}
            onClick={() => handleManagement("accept")}
          >
            <Check />
            Confirmar Recebimento
          </Button>

          <Button
            style={{ width: "100%", border: "1px solid #000" }}
            disabled={wait}
            onClick={() => handleManagement("reject")}
          >
            <Close />
            Cancelar OS
          </Button>
        </div>
      </div>
    );
  } else if (roleLevel() === REACT_APP_BACKOFFICE_ROLE_LEVEL && stage === 1) {
    //Comercial
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div
          className="YAlign"
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Button
            disabled={wait}
            style={{
              margin: "0px 0px 8px 0px",
              border: !wait ? "1px solid #000" : "1px solid #CCC",
            }}
            onClick={(e) => handleManagement("accept")}
          >
            <Check />
            Aceitar OS
          </Button>
        </div>

        <div
          className="XAlign"
          style={{
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <TextInput
            data-lenght={250}
            onChange={(e) => setReject(e.target.value)}
            style={{
              margin: "0px 8px 0px 0px",
              width: "170px",
              borderBottom: "1px solid #AAA",
            }}
            placeholder="Motivo"
          />
          <Button
            style={{
              border:
                rejectReason !== "" && !wait
                  ? "1px solid #000"
                  : "1px solid #CCC",
            }}
            disabled={rejectReason !== "" && !wait ? false : true}
            onClick={(e) => handleManagement("reject")}
          >
            <Close />
            Rejeitar OS
          </Button>
        </div>
      </div>
    );
  } else if (roleLevel() === REACT_APP_TECNICA_ROLE_LEVEL && stage === 2) {
    //Técnica
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div
          className="YAlign"
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <div
            className="XAlign"
            style={{
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <DatePicker
              label="Data Estimada"
              onChange={(e) => updateDate(e._d)}
            />
            <Button
              style={{
                marginBottom: "8px",
                border:
                  prevDate !== null && !wait
                    ? "1px solid #000"
                    : "1px solid #CCC",
              }}
              disabled={prevDate !== null && !wait ? false : true}
              onClick={(e) => handleManagement("accept")}
            >
              <Check />
              Aceitar OS
            </Button>
          </div>

          <label style={{ all: "unset" }}>
            Data esperada: {convertData(Req.OSCDtPretendida)}
          </label>
        </div>

        <div
          className="XAlign"
          style={{
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <TextInput
            data-lenght={250}
            onChange={(e) => setReject(e.target.value)}
            style={{
              margin: "0px 8px 0px 0px",
              width: "170px",
              borderBottom: "1px solid #AAA",
            }}
            placeholder="Motivo"
          />
          <Button
            style={{
              border:
                rejectReason !== "" && !wait
                  ? "1px solid #000"
                  : "1px solid #CCC",
            }}
            disabled={rejectReason !== "" && !wait ? false : true}
            onClick={(e) => handleManagement("reject")}
          >
            <Close />
            Rejeitar OS
          </Button>
        </div>
      </div>
    );
  } else if (roleLevel() === REACT_APP_EXPEDICAO_ROLE_LEVEL && stage === 3) {
    //Expedição
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div
          className="YAlign"
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <div
            className="XAlign"
            style={{
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <DatePicker
              label="Data Estimada"
              onChange={(e) => updateDate(e._d)}
            />
            <Button
              style={{
                marginBottom: "8px",
                border:
                  prevDate !== null && !wait
                    ? "1px solid #000"
                    : "1px solid #CCC",
              }}
              disabled={prevDate !== null && !wait ? false : true}
              onClick={(e) => handleManagement("accept")}
            >
              <Check />
              Gravar
            </Button>
          </div>

          <label style={{ all: "unset" }}>
            Data esperada: {convertData(Req.OSCDtPretendida)}
          </label>
        </div>
      </div>
    );
  } else {
    return (
      <Typography>
        Você não pode gerenciar essa solicitação no momento
      </Typography>
    );
  }
};

const showStatus = (stage) => {
  switch (stage) {
    case 0:
      return "Solicitação concluída";
    case 1:
      return "Solicitação aguarda validação comercial";
    case -1:
      return "Solicitação rejeitada pelo departamento comercial";
    case 2:
      return "Solicitação aguarda validação técnica";
    case -2:
      return "Solicitação rejeitada pelo departamento técnico";
    case 3:
      return "Solicitação aguarda previsão de entrega da logistica";
    case -3:
      return "Solicitação em fase de preparação e transporte";
    case 4:
      return "Solicitação cancelada pelo franqueado";
    default:
      return "Desconhecido";
  }
};
