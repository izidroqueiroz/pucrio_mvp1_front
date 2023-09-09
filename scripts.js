/*
  --------------------------------------------------------------------------------------
  Classe Banheiro
  --------------------------------------------------------------------------------------
*/
class Banheiro {
  constructor(latitude, longitude, classificacao, descricao, tipoToilet) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.classificacao = classificacao;
    this.descricao = descricao;
    this.tipoToilet = tipoToilet;
  }
}

/*
  --------------------------------------------------------------------------------------
  Classe Horario
  --------------------------------------------------------------------------------------
*/
class Horario {
  constructor(weekday, openClosed, openingTime, closingTime) {
    this.weekday = weekday;
    this.openClosed = openClosed;
    this.openingTime = openingTime;
    this.closingTime = closingTime;
  }
}

/*
  --------------------------------------------------------------------------------------
  Inicializa os campos do form
  --------------------------------------------------------------------------------------
*/
const inicializaForm = () => {
  document.getElementById("latitude").value = "";
  document.getElementById("longitude").value = "";
  let inputClassificacaoRadio = document.getElementsByName("classificacao");
  document.getElementById("descricao").value = ""; 
  let inputTipoToiletRadio = document.getElementsByName("tipoToilet");
  var radios = inputClassificacaoRadio;
  for (var i = 0; i < radios.length; i++) {  
    radios[i].checked = false;
  }
  var radios = inputTipoToiletRadio;
  for (var i = 0; i < radios.length; i++) {  
    radios[i].checked = false;
  }
  for (var i = 0; i < semana.length; i++) {
    var dia = semana[i];
    var inputAbertoFechadoRadio = document.getElementsByName("abertoFechado"+dia);
    var radios = inputAbertoFechadoRadio;
    for (var j = 0; j < radios.length; j++) {
      radios[j].checked = false;
    }
    document.getElementById("horaInicio"+dia).disabled = true;
    document.getElementById("horaFim"+dia).disabled = true;
  }
}

/*
  --------------------------------------------------------------------------------------
  Ordena as listas pela distância
  --------------------------------------------------------------------------------------
*/
const ordenaPorDistancia = () => {
  /* Exclui todos os ícones atuais */
  for (var i = 0; i < iconesBanheiros.length; i++) {
    var iconeBanheiro = iconesBanheiros[i];
    iconeBanheiro.remove();
  }
  iconesBanheiros = [];
  /* Ordena a lista de distâncias, sincronizando com as listas de banheiros e horários */
  var houveAlteracao = true;
  var limite = listaDistancias.length;
  while (houveAlteracao) {
    houveAlteracao = false;
    for (var i = 0; i < limite-1; i++) {
      if (listaDistancias[i] > listaDistancias[i+1]) {
        var aux = listaDistancias[i+1]
        listaDistancias[i+1] = listaDistancias[i]
        listaDistancias[i] = aux
        var aux = listaBanheiros[i+1]
        listaBanheiros[i+1] = listaBanheiros[i]
        listaBanheiros[i] = aux
        var aux = listaHorarios[i+1]
        listaHorarios[i+1] = listaHorarios[i]
        listaHorarios[i] = aux
        houveAlteracao = true;
      }
    }
    limite--;
  }
  /* Inclui os ícones dos banheiros, indicando o banheiro mais próximo */
  for (i = 0; i < listaBanheiros.length; i++) {
    if (i===0) {
      var cor = 'vermelho';
    } else {
      cor = 'verde';
    } 
    var banheiro = listaBanheiros[i];
    incluiIconeBanheiro(banheiro.latitude, banheiro.longitude, cor);
  } 
}

/*
  --------------------------------------------------------------------------------------
  Atualiza a tabela, após mudança nas listas
  --------------------------------------------------------------------------------------
*/
const atualizaTabela = () => {
  for (var i = 0; i < listaDistancias.length; i++) {
    var banheiro = listaBanheiros[i];
    var distancia = listaDistancias[i];
    var table = document.getElementById('toiletTable');
    var row = table.rows[i+1];
    row.cells[0].innerHTML = banheiro.latitude;      /* posição 0 = latitude      */
    row.cells[1].innerHTML = banheiro.longitude;     /* posição 1 = longitude     */
    row.cells[2].innerHTML = banheiro.classificacao; /* posição 2 = classificacao */
    row.cells[3].innerHTML = banheiro.descricao;     /* posição 3 = descricao     */
    row.cells[4].innerHTML = banheiro.tipoToilet;    /* posição 4 = tipo          */
    row.cells[5].innerHTML = distancia.toFixed(2);   /* posição 5 = distância     */
  }  
}

/*
  --------------------------------------------------------------------------------------
  Obtém a lista dos banheiros cadastrados no servidor
  --------------------------------------------------------------------------------------
*/
const getToilets = async () => {
  let url = 'http://127.0.0.1:5000/toilets';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.toilets.forEach(toilet => {
        var toiletX = toilet.toilet[0];
        var openingHours = toilet.toilet[1].openingHours;
        var banheiro = new Banheiro(toiletX.latitude, toiletX.longitude, 
          toiletX.classification, toiletX.description, toiletX.toiletType);
        var horarios = [];
        for (var i = 0; i < openingHours.length; i++) {
          var horario = new Horario(openingHours[i].weekday, openingHours[i].openClosed,
            openingHours[i].openingTime, openingHours[i].closingTime);
          horarios.push(horario);
        }
        distancia = calculaDistancia(banheiro.latitude, banheiro.longitude);
        listaBanheiros.push(banheiro);
        listaHorarios.push(horarios);
        listaDistancias.push(distancia);
        insertToilet(banheiro.latitude, banheiro.longitude,
          banheiro.classificacao, banheiro.descricao, 
          banheiro.tipoToilet, distancia);
        }); 
        ordenaPorDistancia(); 
        atualizaTabela();  
      })
    .catch((error) => {
      console.error('Error:', error);
      return false; /* houve erro */
    });
  return true; /* não houve erro */
}

/*
  --------------------------------------------------------------------------------------
  Obtém um banheiro, a partir da latitude e longitude
  --------------------------------------------------------------------------------------
*/
const getToilet = async (latitude, longitude) => {
  let url = 'http://127.0.0.1:5000/toilet?lat='+latitude+'&long='+longitude;
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      var toiletX = data.toilet[0];
      var openingHours = data.toilet[1].openingHours;
      var banheiro = new Banheiro(toiletX.latitude, toiletX.longitude, 
        toiletX.classification, toiletX.description, toiletX.toiletType);
      var horarios = [];
      for (var i = 0; i < openingHours.length; i++) {
        var horario = new Horario(openingHours[i].weekday, openingHours[i].openClosed,
          openingHours[i].openingTime, openingHours[i].closingTime);
        horarios.push(horario);
      }
      preencheToilet(banheiro, horarios);
      })
    .catch((error) => {
      console.error('Error:', error);
      return false; /* houve erro */
    });
  return true; /* não houve erro */
}

/*
  --------------------------------------------------------------------------------------
  Preenche os campos a partir de um banheiro informado
  --------------------------------------------------------------------------------------
*/
const preencheToilet = (banheiro, horarios) => {
  document.getElementById("latitude").value = banheiro.latitude;
  document.getElementById("longitude").value = banheiro.longitude;
  let inputClassificacaoRadio = document.getElementsByName("classificacao");
  document.getElementById("descricao").value = banheiro.descricao;
  let inputTipoToiletRadio = document.getElementsByName("tipoToilet");
  var radios = inputClassificacaoRadio;
  for (var i = 0; i < radios.length; i++) {  
      if (radios[i].value === banheiro.classificacao.toString()) {
        radios[i].checked = true;
      } 
  }
  var radios = inputTipoToiletRadio;
  for (var i = 0; i < radios.length; i++) {  
    if (radios[i].value === banheiro.tipoToilet) {
      radios[i].checked = true;
    } 
  }
  preencheHorarios(horarios);
}

/*
  --------------------------------------------------------------------------------------
  Preenche os horarios de um banheiro
  --------------------------------------------------------------------------------------
*/
const preencheHorarios = (horarios) => {
  for (var i = 0; i < semana.length; i++) {
    var horario = horarios[i];
    var dia = semana[i];
    var inputAbertoFechadoRadio = document.getElementsByName("abertoFechado"+dia);
    var radios = inputAbertoFechadoRadio;
    for (var j = 0; j < radios.length; j++) {
      var prefixo = radios[j].value.substring(0,1);
      if (prefixo === 'A') {
        prefixo = 'O' /* (O)pen */
      } else {
        prefixo = 'C' /* (C)losed */
      }
      if (prefixo === horario.openClosed) {
        radios[j].checked = true;
        if (radios[j].value === 'Aberto') {
          document.getElementById("horaInicio"+dia).disabled = false;
          document.getElementById("horaFim"+dia).disabled = false;
          document.getElementById("horaInicio"+dia).value = horario.openingTime;
          document.getElementById("horaFim"+dia).value = horario.closingTime;
        } else if (radios[j].value === 'Fechado') {
          document.getElementById("horaInicio"+dia).disabled = true;
          document.getElementById("horaFim"+dia).disabled = true;
        }
      }
    } 
  } 
}

/*
  --------------------------------------------------------------------------------------
  Atualiza as distâncias dos banheiros quando o "marker" é reposicionado pelo usuário
  --------------------------------------------------------------------------------------
*/
const atualizaDistancias = () => {
  for (var i = 0; i < listaBanheiros.length; i++) {
    let latitude = listaBanheiros[i].latitude;
    let longitude = listaBanheiros[i].longitude;
    listaDistancias[i] = calculaDistancia(latitude, longitude);
  }  
}

/*
  --------------------------------------------------------------------------------------
  Formata o mapa
  --------------------------------------------------------------------------------------
*/
var posicaoInicial = [-23.004678325889472, -43.31867551816686];
var map = L.map('map').setView(posicaoInicial, 14);
map.locate({maxZoom: 20});
var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', 
            {maxZoom: 20,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map); 
var posicaoUsuario = L.marker(posicaoInicial, {draggable: true, autoPan: true}).addTo(map);
posicaoUsuario.addEventListener("move", (event) => {
  if (banheiroEmInclusao) {
    desativaInclusaoBanheiro(document.getElementById("latitude").value, 
                             document.getElementById("longitude").value);
  }  
  if (banheiroEmAtualizacao) {
    desativaAtualizacaoBanheiro();
  }
  atualizaDistancias();
  ordenaPorDistancia();
  atualizaTabela();
});
var iconesBanheiros = [];
var banheiroEmInclusao = false;
var banheiroEmAtualizacao = false;
var Circulo = null;

/*
  --------------------------------------------------------------------------------------
  Nos campos de horários dos dias da semana, desabilita 'hora de início' e 'hora de fim'
  quando o banheiro estiver fechado
  --------------------------------------------------------------------------------------
*/
var semana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
for (var i = 0; i < semana.length; i++) {
  const selectAberto = document.querySelector("#aberto"+semana[i]);
  const selectFechado = document.querySelector("#fechado"+semana[i]);
  const selectHoraInicio = document.querySelector("#horaInicio"+semana[i]);
  const selectHoraFim = document.querySelector("#horaFim"+semana[i]);
  selectAberto.addEventListener("change", (event) => {
    selectHoraInicio.disabled = false;
    selectHoraFim.disabled = false;
  });
  selectFechado.addEventListener("change", (event) => {
    selectHoraInicio.disabled = true;
    selectHoraFim.disabled = true;
});
}

/*
  --------------------------------------------------------------------------------------
  Inicialização
  --------------------------------------------------------------------------------------
*/
var listaBanheiros  = [];
var listaHorarios   = [];
var listaDistancias = [];
var inputLatitude, inputLongitude, inputClassificacao, inputDescricao, inputTipoToilet;
inicializaForm();
getToilets();

/*
  --------------------------------------------------------------------------------------
  Desenha um ícone de banheiro em uma posição do mapa
  --------------------------------------------------------------------------------------
*/
const incluiIconeBanheiro = (latitude, longitude, cor) => {
  var toiletIcon = L.icon({
    iconUrl: 'img/banheiro-'+cor+'.png',
    iconSize: [32, 32] 
  });
  var iconeBanheiro = L.marker([latitude, longitude], {icon: toiletIcon}).addTo(map);
  iconeBanheiro.addEventListener("click", (event) => {
    getToilet(latitude, longitude); 
    if (banheiroEmInclusao) {
      desativaInclusaoBanheiro(document.getElementById("latitude").value, 
                               document.getElementById("longitude").value);
    }  
    if (banheiroEmAtualizacao) {
      desativaAtualizacaoBanheiro();
    }
    ativaAtualizacaoBanheiro(latitude, longitude);
  });
iconesBanheiros.push(iconeBanheiro);
}

/*
  --------------------------------------------------------------------------------------
  Desativa o modo de inclusão de um banheiro
  --------------------------------------------------------------------------------------
*/
const desativaInclusaoBanheiro = (latitude, longitude) => {
  excluiIconeBanheiro(latitude, longitude);
  banheiroEmInclusao = false;
  inicializaForm();
}

/*
  --------------------------------------------------------------------------------------
  Ativa o modo de atualização de um banheiro
  --------------------------------------------------------------------------------------
*/
const ativaAtualizacaoBanheiro = (latitude, longitude) => {
  banheiroEmAtualizacao = true;
  Circulo = L.circle([latitude, longitude], {
    color: 'red',
    fillOpacity: 0.0,
    radius: 80
  }).addTo(map);
  var botao = document.getElementById("novoBotao");
  botao.textContent  = 'Alterar banheiro';
  botao.onclick = atualizaBanheiro;
}

/*
  --------------------------------------------------------------------------------------
  Desativa o modo de atualização de um banheiro
  --------------------------------------------------------------------------------------
*/
const desativaAtualizacaoBanheiro = () => {
  banheiroEmAtualizacao = false;
  Circulo.remove();
  Circulo = null;
  inicializaForm();
  var botao = document.getElementById("novoBotao");
  botao.textContent  = 'Incluir banheiro';
  botao.onclick = novoBanheiro;
}

/*
  --------------------------------------------------------------------------------------
  Exclui um ícone de banheiro em uma posição do mapa
  --------------------------------------------------------------------------------------
*/
const excluiIconeBanheiro = (latitude, longitude) => {
  for (var i = 0; i < iconesBanheiros.length; i++) { 
    var iconeBanheiro = iconesBanheiros[i];
    var posicaoBanheiro = iconeBanheiro.getLatLng();
    var posicaoAExcluir = L.latLng(latitude, longitude);
    if (posicaoBanheiro.equals(posicaoAExcluir)) {
      iconeBanheiro.remove();
      iconesBanheiros.splice(i,1);
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Marca uma posição no mapa, onde será incluído um banheiro
  --------------------------------------------------------------------------------------
*/
function onMapClick(e) {
  if (banheiroEmInclusao) {
    desativaInclusaoBanheiro(document.getElementById("latitude").value, 
                             document.getElementById("longitude").value);
  }
  if (banheiroEmAtualizacao) {
    desativaAtualizacaoBanheiro();
  }
  banheiroEmInclusao = true;
  incluiIconeBanheiro(e.latlng.lat, e.latlng.lng, 'azul');
  lat  = e.latlng.lat.toString();
  long = e.latlng.lng.toString();
  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = long;
}
map.on('click', onMapClick);

/*
  --------------------------------------------------------------------------------------
  Inclui um novo banheiro na base no servidor
  --------------------------------------------------------------------------------------
*/
const postToilet = async (inputLatitude, inputLongitude, 
                        inputClassificacao, inputDescricao, inputTipoToilet,
                        horarios) => {
  const formData = new FormData();
  formData.append('latitude', inputLatitude);
  formData.append('longitude', inputLongitude);
  formData.append('classification', inputClassificacao);
  formData.append('description', inputDescricao);
  formData.append('toiletType', inputTipoToilet);
  horarios.forEach(item => {
    formData.append(`openingHours`, JSON.stringify(item));
  }); 

  var urlPost = 'http://127.0.0.1:5000/toilet';
  if (banheiroEmAtualizacao) {
    urlPost = 'http://127.0.0.1:5000/toiletEdit';
  }

  let url = urlPost;
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json()) 
    .catch((error) => {
      console.error('Error:', error);
      return false; /* houve erro */
    });
return true; /* indica que não houve erro */
}

/*
  --------------------------------------------------------------------------------------
  Cria um botão de exclusão para cada banheiro da tabela
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7"); /* Unicode Character 'MULTIPLICATION SIGN' */
  span.className = "close";
  span.appendChild(txt);
  span.onclick = function () {
    if (banheiroEmInclusao) {
      desativaInclusaoBanheiro(document.getElementById("latitude").value, 
                               document.getElementById("longitude").value);
    }  
    if (banheiroEmAtualizacao) {
      desativaAtualizacaoBanheiro();
    }
    let row = this.parentElement.parentElement;
    let rowIndex = row.rowIndex; 
    let posicaoLista = rowIndex - 1;
    let latitude  = listaBanheiros[posicaoLista].latitude;
    let longitude = listaBanheiros[posicaoLista].longitude;
    if (confirm("Você tem certeza?")) {
      row.remove();
      deleteToilet(latitude, longitude);
      listaBanheiros.splice(posicaoLista,1);
      listaHorarios.splice(posicaoLista,1);
      listaDistancias.splice(posicaoLista,1);
      ordenaPorDistancia();
      atualizaTabela();   
      alert("Removido!");
    }
  }
  parent.appendChild(span);
}

/*
  --------------------------------------------------------------------------------------
  Exclui um banheiro na base no servidor
  --------------------------------------------------------------------------------------
*/
const deleteToilet = (latitude, longitude) => {
  let url = 'http://127.0.0.1:5000/toilet?lat=' + latitude + '&long=' + longitude;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
      return;
    });
  excluiIconeBanheiro(latitude, longitude);
}

/*
  --------------------------------------------------------------------------------------
  Calcula a distância entre a posição indicada no mapa e um banheiro 
  --------------------------------------------------------------------------------------
*/
const calculaDistancia = (latitude, longitude) => {
var posicaoBanheiro = L.latLng(latitude, longitude);
var distancia = (posicaoBanheiro.distanceTo(posicaoUsuario.getLatLng()));
return distancia;
}

/*
  --------------------------------------------------------------------------------------
  Adiciona um novo banheiro informado
  --------------------------------------------------------------------------------------
*/
const novoBanheiro = () => {
  inputBanheiro();
  if (inputLatitude === '') {
    alert("Informe a posição do banheiro a ser incluído!");
  } else if (inputClassificacao === '') {
    alert("Classificação não informada!");
  } else if (inputTipoToilet === '') {
    alert("Tipo do banheiro não informado!");
  } else if (checkHorarios()) { 
    var horarios = []
    horarios = inputHorarios();
    var retornoPostOK = postToilet(inputLatitude, inputLongitude, inputClassificacao, 
                        inputDescricao, inputTipoToilet, horarios);
    if (retornoPostOK) { /* se não houve erro, retorna true */
        var banheiro = new Banheiro(inputLatitude, inputLongitude, inputClassificacao,
                        inputDescricao, inputTipoToilet);
        distancia = calculaDistancia(parseFloat(inputLatitude), parseFloat(inputLongitude));
        listaBanheiros.push(banheiro);
        listaHorarios.push(horarios);
        listaDistancias.push(distancia);
        insertToilet(inputLatitude, inputLongitude, inputClassificacao, inputDescricao,
                        inputTipoToilet, distancia);
        ordenaPorDistancia();
        atualizaTabela();   
        inicializaForm();  
        desativaInclusaoBanheiro();   
        alert("Banheiro adicionado!");
      }
  } 
} 

/*
  --------------------------------------------------------------------------------------
  Atualiza um banheiro
  --------------------------------------------------------------------------------------
*/
const atualizaBanheiro = () => {
  inputBanheiro();
  if (inputClassificacao === '') {
    alert("Classificação não informada!");
  } else if (inputTipoToilet === '') {
    alert("Tipo do banheiro não informado!");
  } else if (checkHorarios()) { 
    var horarios = []
    horarios = inputHorarios();
    var retornoPostOK = postToilet(inputLatitude, inputLongitude, inputClassificacao, 
                        inputDescricao, inputTipoToilet, horarios);
    if (retornoPostOK) { /* se não houve erro, retorna true */
      var banheiro = new Banheiro(inputLatitude, inputLongitude, inputClassificacao,
        inputDescricao, inputTipoToilet);
      distancia = calculaDistancia(parseFloat(inputLatitude), parseFloat(inputLongitude));
      for (var i = 0; i < listaBanheiros.length; i++) {
        if (listaBanheiros[i].latitude.toString()  === inputLatitude &
            listaBanheiros[i].longitude.toString() === inputLongitude) {
            listaBanheiros.splice(i,1,banheiro);
            listaHorarios.splice(i,1,horarios);
            listaDistancias.splice(i,1,distancia);
        }
      }
      atualizaTabela();  
      inicializaForm(); 
      desativaAtualizacaoBanheiro();
      alert("Banheiro atualizado!");
    }
  } 
} 

/*
  --------------------------------------------------------------------------------------
  Obtém as informações do banheiro
  --------------------------------------------------------------------------------------
*/
const inputBanheiro = () => {
inputLatitude = document.getElementById("latitude").value;
inputLongitude = document.getElementById("longitude").value;  
let inputClassificacaoRadio = document.getElementsByName("classificacao");
inputDescricao = document.getElementById("descricao").value;
let inputTipoToiletRadio = document.getElementsByName("tipoToilet");
inputClassificacao = '';
var radios = inputClassificacaoRadio;
  for (var i = 0; i < radios.length; i++) {  
    if (radios[i].checked) {
      inputClassificacao = radios[i].value;
    } 
  }
inputTipoToilet = '';
radios = inputTipoToiletRadio;
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      inputTipoToilet = radios[i].value;
    }
  }
return (inputLatitude, inputLongitude, inputClassificacao,
  inputDescricao, inputTipoToilet);
}

/*
  --------------------------------------------------------------------------------------
  Verifica se os horários informados estão OK
  --------------------------------------------------------------------------------------
*/
const checkHorarios = () => {
  for (var i = 0; i < semana.length; i++) {
    var dia = semana[i];
    var inputAbertoFechadoRadio = document.getElementsByName("abertoFechado"+dia);
    var inputAbertoFechado = '';
    var inputHoraInicio = ''
    var inputHoraFim = ''
    var radios = inputAbertoFechadoRadio;
    for (var j = 0; j < radios.length; j++) {
        if (radios[j].checked) {
          if (radios[j].value === 'Aberto') {
            inputAbertoFechado = 'O'; /* (O)pen */
            inputHoraInicio = document.getElementById("horaInicio"+dia).value;
            inputHoraFim = document.getElementById("horaFim"+dia).value;
            if (inputHoraInicio >= inputHoraFim) {
              alert("Hora de início deve ser menor que a hora de fim.");
              return false;
            }
          } else if (radios[j].value === 'Fechado') {
            inputAbertoFechado = 'C'; /* (C)losed */
            inputHoraInicio = null;
            inputHoraFim = null;
          }
        }
    }
    if (inputAbertoFechado === '') {
      alert("Informar se o banheiro está aberto ou fechado.");
      return false;
    }
  }
return true; /* Horarios OK */
}

/*
  --------------------------------------------------------------------------------------
  Obtém os horários informados
  --------------------------------------------------------------------------------------
*/
const inputHorarios = () => {
  var horarios = [];
  for (var i = 0; i < semana.length; i++) {
    var dia = semana[i];
    var inputAbertoFechadoRadio = document.getElementsByName("abertoFechado"+dia);
    var inputAbertoFechado = '';
    var inputHoraInicio = ''
    var inputHoraFim = ''
    var radios = inputAbertoFechadoRadio;
    for (var j = 0; j < radios.length; j++) {
        if (radios[j].checked) {
          if (radios[j].value === 'Aberto') {
            inputAbertoFechado = 'O'; /* (O)pen */
            inputHoraInicio = document.getElementById("horaInicio"+dia).value;
            inputHoraFim = document.getElementById("horaFim"+dia).value;
          } else if (radios[j].value === 'Fechado') {
            inputAbertoFechado = 'C'; /* (C)losed */
            inputHoraInicio = null;
            inputHoraFim = null;
          }
        }
    }
    var horario = new Horario(i, inputAbertoFechado, inputHoraInicio, 
              inputHoraFim);
    horarios.push(horario);
  }
return horarios;
}

/*
  --------------------------------------------------------------------------------------
  Insere um banheiro na tabela
  --------------------------------------------------------------------------------------
*/
const insertToilet = (latitude, longitude, classificacao, descricao, tipoToilet, distancia) => { 
  var toilet = [parseFloat(latitude), 
                  parseFloat(longitude), classificacao, 
                  descricao, tipoToilet, distancia.toFixed(2)];
  var table = document.getElementById('toiletTable');
  var row = table.insertRow();

  for (var i = 0; i < toilet.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = toilet[i];
  }
  insertButton(row.insertCell(-1))
}