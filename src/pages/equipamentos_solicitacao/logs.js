import React from 'react'
import { api } from '../../services/api'
import { saveAs } from 'file-saver'

import Loading from '../../components/loading_screen'
import { Button, Modal, Icon, Table, Textarea } from 'react-materialize'
import { ToastyContainer, Toast } from '../../components/toasty'
import { dateCheck, convertData } from '../../components/commom_functions'
import AdmModal from './modals/admModal'
import { CloseButton } from '../../components/buttons'

export default class Logs extends React.Component {
  state = {
    logs: [],
    loaded: false
  }

  async componentDidMount() {
    try {
      const response = await api.get('/equip/requests', {
        params: {
          token: sessionStorage.getItem('token')
        }
      })

      this.setState({ logs: response.data, loaded: true })
    } catch (err) {

      this.props.history.push('/')
    }
  }

  async handleRetrivePDF(OSID) {
    try {
      const response = await api.get('/equip/requests/retrive', {
        params: {
          token: sessionStorage.getItem('token'),
          OSID
        },
        responseType: 'arraybuffer'
      })

      //Converto a String do PDF para BLOB (Necessario pra salvar em pdf)
      const blob = new Blob([response.data], { type: 'application/pdf' })

      //Salvo em PDF junto com a data atual, só pra não sobreescrever nada
      saveAs(blob, `OS_${dateCheck()}.pdf`)
    } catch (err) {
      Toast('Falha ao recuperar PDF do servidor', 'error')
    }
  }

  async checkView(ID) {
    try {
      //Insere a data de vizualização da ordem por X departamento
      const response = await api.put('/equip/requests/check', {
        token: sessionStorage.getItem('token'),
        ID,
        when: dateCheck()
      })

      console.log(response.data)
    } catch (err) {
      console.log(err)
      Toast('Falha ao linkar dados da OS', 'error')
    }
  }

  render() {
    return !this.state.loaded ? (
      <Loading />
    ) : this.state.logs.length > 0 ? ( //Se nao tiver nenhum log, nem mostra a estrutura da tabela
      <Table centered hoverable>
        <ToastyContainer />
        <thead>
          <tr>
            <th>Solicitação Nº</th>
            <th>Status</th>
            <th>Data de solicitação</th>
            <th>Data pretendida</th>
            <th>Data estimada</th>
            <th>Destino</th>
            <th>Gerenciar</th>
          </tr>
        </thead>
        {this.state.logs.map((log, i) => (
          <tr>
            <td align='center'>{log.OSCId}</td>
            <td align='center'>{log.OSCStatus}</td>
            <td align='center'>{convertData(log.OSCDtSolicita)}</td>
            <td align='center'>{convertData(log.OSCDtPretendida)}</td>
            <td align='center'>{log.OSCExpDtPrevisao !== '' ? convertData(log.OSCExpDtPrevisao) : ''}</td>
            <td align='center'>
              <Textarea
                onChange={e => e.target.value = log.OSCDestino }
                value={log.OSCDestino}
              />
            </td>
            <td>
              <Modal
                actions={[
                  <CloseButton />
                ]}
                bottomSheet={false}
                fixedFooter={false}
                header='Gerenciamento de solicitação'
                id='modal10'
                options={{
                  dismissible: true,
                  endingTop: '10%',
                  inDuration: 250,
                  onCloseEnd: null,
                  onCloseStart: null,
                  onOpenEnd: null,
                  onOpenStart: () => this.checkView(this.state.logs[i].OSCId),
                  opacity: 0.5,
                  outDuration: 250,
                  preventScrolling: true,
                  startingTop: '4%'
                }}
                trigger={
                  <Button
                    style={{
                      marginBottom: '10px'
                    }}
                  >
                    <Icon>settings</Icon>
                  </Button>
                }
              >
                <AdmModal LOGS={this.state.logs[i]} />
              </Modal>
            </td>
          </tr>
        ))}
      </Table>
    ) : (
      <h3>Você ainda não fez nenhuma solicitação!</h3>
    )
  }
}