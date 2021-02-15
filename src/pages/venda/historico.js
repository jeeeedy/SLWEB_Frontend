import React, { Component } from 'react'
import { api } from '../../services/api'
import { Toast } from '../../components/toasty'

import { Icon, Button, Modal } from 'react-materialize'
import { convertData } from '../../components/commom_functions'
import { CloseButton } from '../../components/buttons'

export default class Historico extends Component {
  state = {
    vendas: [],
    pedido: [],
    pedidoDados: [],
    NFAtual: ''
  }

  componentDidMount() {
    try {
      this.setState({
        vendas: this.props.vendas
      })

      console.log(this.props.vendas)
    } catch (err) {
      Toast('Falha ao comunicar com o servidor', 'error')
    }
  }

  showStatus(status) {
    switch (status) {
      case null:
        return <Icon center>playlist_add_check</Icon>
      case 'C':
        return <Icon center>money_off</Icon>

      case 'S':
        return <Icon center>sync_problem</Icon>

      default:
        return <Icon center>playlist_add_check</Icon>
    }
  }

  async handleSeeSell(i) {
    this.setState({ NFAtual: this.state.vendas[i].PvcID })
    try {
      const response = await api.get('/sell/order', {
        params: {
          token: sessionStorage.getItem('token'),
          NF: this.state.vendas[i].PvcID
        }
      })

      console.log(response.data)

      this.setState({
        pedido: response.data.prodList,
        pedidoDados: response.data.prodData
      })
    } catch (err) {
      Toast('Falha ao buscar dados da venda')
    }
  }

  handleGenPDF() {
    alert('Em Desenvolvimento')
  }

  handleGenNF() {
    alert('Em Desenvolvimento')
  }

  handleGenExcel() {
    alert('Em Desenvolvimento')
  }

  async handleDellSell() {
    try {
      const response = await api.delete('/sell/delete', {
        params: {
          token: sessionStorage.getItem('token'),
          NF: this.state.NFAtual
        }
      })

      switch (response.data) {
        case 'TOTVS':
          Toast(
            'Venda realizada pelo TOTVS não pode ser cancelada, faça nota de devolução',
            'error'
          )
          break
        case 'CANCELADO':
          Toast('Venda já foi cancelada', 'error')
          break
        case 'EXPIROU D':
          Toast(
            'Venda realizada à mais de dez dias não pode ser cancelada',
            'error'
          )
          break
        case 'EXPIROU M':
          Toast(
            'Venda realizada à mais de um mês não pode ser cancelada',
            'error'
          )
          break
        case 400:
          Toast('Falha ao processar a requisição', 'error')
          break
        default:
          Toast('Venda cancelada com sucesso', 'success')
          setTimeout(() => window.location.reload(), 3000)
          break
      }
    } catch (err) {
      Toast('Falha ao cancelar a venda', 'error')
    }
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '97vw'
        }}
      >
        <div
          className='tableFixHead'
          style={{
            height: '70vh',
            width: '55%',
            overflow: 'auto'
          }}
        >
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Emissão</th>
                <th>NF</th>
                <th>CNPJ D.</th>
                <th>Destinatário</th>
              </tr>
            </thead>
            <tbody>
              {this.state.vendas.map((venda, i) => (
                <tr className='Item' onClick={() => this.handleSeeSell(i)}>
                  <td>{this.showStatus(venda.STATUS)}</td>
                  <td>{convertData(venda.DataIntegracao)}</td>
                  <td>{venda.PvcID}</td>
                  <td>{venda.CNPJss}</td>
                  <td>{venda.Nome_Fantasia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className='tableFixHead'
          style={{
            height: '70vh',
            width: '55%',
            overflow: 'auto'
          }}
        >
          <table>
            <thead>
              <tr>
                <th>NF</th>
                <th>Produto</th>
                <th>Qtda.</th>
                <th>Valor Un.</th>
                <th>Valor total</th>
              </tr>
            </thead>
            <tbody>
              {this.state.pedido.map((pedido, i) => (
                <tr>
                  <td>{this.state.pedidoDados[i].PvcID}</td>
                  <td>{pedido.Produto}</td>
                  <td>{this.state.pedidoDados[i].PvdQtd.toFixed(2)}</td>
                  <td>{this.state.pedidoDados[i].PvdVlrUnit.toFixed(2)}</td>
                  <td>{this.state.pedidoDados[i].PvdVlrTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {this.state.NFAtual && (
            <div
              style={{
                display: 'flex',
                marginTop: '10px',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <Button
                onClick={() => {
                  this.handleGenNF()
                }}
              >
                Gerar NF
                <Icon left>insert_drive_file</Icon>
              </Button>
              <Button
                disabled
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  this.handleGenPDF()
                }}
              >
                Gerar PDF
              </Button>
              <Button
                disabled
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  this.handleGenExcel()
                }}
              >
                Gerar Excel
              </Button>
              <Button
                className='modal-trigger'
                href='#modal1'
                node='button'
                style={{ marginLeft: '10px' }}
              >
                Cancelar venda
              </Button>

              <Modal
                actions={[
                  <Button
                    style={{ backgroundColor: 'red' }}
                    onClick={() => {
                      this.handleDellSell()
                    }}
                  >
                    <Icon left>warning</Icon>
                    Confirmar
                  </Button>,
                  <CloseButton />
                ]}
                bottomSheet={false}
                fixedFooter={false}
                header='Confirmação'
                id='modal1'
                options={{
                  dismissible: true,
                  endingTop: '10%',
                  inDuration: 250,
                  onCloseEnd: null,
                  onCloseStart: null,
                  onOpenEnd: null,
                  onOpenStart: null,
                  opacity: 0.5,
                  outDuration: 250,
                  preventScrolling: true,
                  startingTop: '4%'
                }}
              >
                Cancelar da venda de NF {this.state.NFAtual}?
              </Modal>
            </div>
          )}
        </div>
      </div>
    )
  }
}