//TESTADA
function init(){
	//latencia maior para n deixar o código entrar em loop caso haja um problema
	var maiorLatencia = {value:0};
	var listaInstrucoes  = carregarDados(maiorLatencia);	
	var listadeFotos = [];
	var limiteClock = maiorLatencia.value * (listaInstrucoes.length+1) + 2 * (listaInstrucoes.length);	
	resolverTomasulo(listaInstrucoes,listadeFotos,limiteClock);
}

//TESTADA
function carregarDados(maiorLatencia){
	var listaInstrucoes = [];
	//criar lista de instruções Rafael, ja colocando a latencia junto com as instruções;		
	var quantidade = parseInt(window.localStorage.getItem("quantidade"));	
	for(var i = 0; i < quantidade; i++) { 
		var nome = window.localStorage.getItem("t"+i);		
		var op0 = window.localStorage.getItem("r"+i);
		var op1 = window.localStorage.getItem("s"+i);
		var op2 = window.localStorage.getItem("d"+i);
		var l = 0;
		if(nome == "ADD.D" || nome == "SUBD" /*|| nome == "DADDUI"*/){
			l = parseInt(window.localStorage.getItem("qtdAdd"));
		}
		else if(nome == "MULTD"){
			l = parseInt(window.localStorage.getItem("qtdMult"));
		}
		else if(nome == "DIV.D"){
			l = parseInt(window.localStorage.getItem("qtdDiv"));
		}
		else if(nome == "L.D"){
			l = parseInt(window.localStorage.getItem("qtdLoad"));							 	
		}
		else if(nome == "S.D"){
			l = parseInt(window.localStorage.getItem("qtdStore"));
		}
		else{
			l = parseInt(window.localStorage.getItem("qtdInt"));
		}			 					 					 		

		//troco a maiorLatencia
		if(l > maiorLatencia.value){
			maiorLatencia.value = l;
		}

		listaInstrucoes.push(new Instrucao(nome,op0,op1,op2,l));		
	}									
	return listaInstrucoes;
}

//TESTADA
function resolverTomasulo(listaInstrucoes,listadeFotos,limiteClock){		
	//incializar dados
	var listaInstrucoesPronta = [];	
	var fimExecucao = [];
	for(var i = 0; i < listaInstrucoes.length; i++){
		listaInstrucoesPronta[i] = false;		
		fimExecucao[i] = -1;
	}	
	var pc = 0;
	var clock = 1;
	
	var instructionStatus = new InstructionStatus(listaInstrucoes.length);
	var reservationStation = new ReservationStation();
	var registerFile = new RegisterFile();			
	var contGlobal = {value:0};						

	//criando foto 0
	var instructionStatusCopy = JSON.parse(JSON.stringify(instructionStatus));
	var reservationStationCopy = JSON.parse(JSON.stringify(reservationStation));
	var registerFileCopy = JSON.parse(JSON.stringify(registerFile));
	listadeFotos.push(new Foto(instructionStatusCopy,reservationStationCopy,registerFileCopy,0));
	//resolver algoritmo	
	//milestone	
	var entrouEmLoop = false;
	while(!resolveuTudo(listaInstrucoesPronta) && !entrouEmLoop){
		//despachar a instrução	se existe instrucao com este pc	
		var despachou = false;		
		if(pc < listaInstrucoes.length){
			despachou = despachar(pc,listaInstrucoes[pc],clock,instructionStatus,reservationStation,registerFile,contGlobal);
		}				
		//Executar processamento nesse ciclo
		atualizar(pc,listaInstrucoes,listaInstrucoesPronta,clock,instructionStatus,reservationStation,fimExecucao,registerFile,contGlobal);

		//tirar foto já inserindo na lista de resolução
		instructionStatusCopy = JSON.parse(JSON.stringify(instructionStatus));
		reservationStationCopy = JSON.parse(JSON.stringify(reservationStation));
		registerFileCopy = JSON.parse(JSON.stringify(registerFile));
		var foto = new Foto(instructionStatusCopy,reservationStationCopy,registerFileCopy,clock);
		listadeFotos.push(foto);				

		//incrementar pc caso houve despacho
		if(despachou){
			pc++;
		}
		//incrementar o clock		
		clock++;
		//verificar possivel loop no algoritmo
		if(clock > limiteClock){
			entrouEmLoop = true;
		}
	}
	window.localStorage.setItem("listaFotos",JSON.stringify(listadeFotos));
}

//TESTADA
function atualizar(pc,listaInstrucao,listaInstrucoesPronta,clock,instructionStatus,reservationStation,fimExecucao,registerFile,contGlobal){
	var auxProntos = [];
	for(var k = 0; k < listaInstrucao.length; k++){
		auxProntos[k] = false;
	}
	//verificar se a instrucao i terminou
	for(var i = 0; i < pc; i++){
		if(!listaInstrucoesPronta[i]){
			//não começou a executar						
			if(fimExecucao[i] == -1){
				//verificar porque não começou
				var instrucao = listaInstrucao[i];				
				var unidadeEnome = acharUnidade(instrucao,reservationStation);
				var unidade = unidadeEnome[0];
				var nome = unidadeEnome[1];
				var pos = instrucao.posicaoUnidade;
				var podeExecutar = false;
				if(nome != "Store" && nome != "Load"){
					if(instrucao.nome == "BNEZ"){
						if(unidade[pos].vj != ""){
							podeExecutar = true;	
						}	
					}
					else if(unidade[pos].vj != "" && unidade[pos].vk != ""){
						podeExecutar = true;										
					}					
				}	
				else if(nome != "Load"){
					if(unidade[pos].vj != ""){
						podeExecutar = true;
					}
				}
				//caso seja load, sempre executa
				else{
					podeExecutar = true;
				}

				if(podeExecutar){
					fimExecucao[i] = clock-1+instrucao.latencia;
				}
			}
			if(fimExecucao[i] == clock){
				//execution complete
				instructionStatus.matrizStatus[i][1] = clock;

			}
			else if(fimExecucao[i]+1 == clock){
				//escrever resultado
				instructionStatus.matrizStatus[i][2] = clock;				
				auxProntos[i] = true;							
			} 			
		}
	}

	//limpar as unidades
	for(var k = 0; k < auxProntos.length; k++){
		if(auxProntos[k] == true){			
			var instrucao = listaInstrucao[k];						
			if(instrucao.nome != "S.D" && instrucao.nome != "BEQ" && instrucao.nome != "BNEZ"){
				var posicao = registerFile.acharPosicao(instrucao.op0);
				atualizaReservationStation(registerFile.apelido[posicao],reservationStation,contGlobal,instrucao);				
				registerFile.apelido[posicao] = instrucao.op0+"_"+contGlobal.value;
				contGlobal.value++;
				registerFile.registerSolved[posicao] = true;
			}				
			listaInstrucoesPronta[k] = true;
			limparUnidade(reservationStation,instrucao);			
		}			
	}
}

//TESTDA
function limparUnidade(reservationStation,instrucao){
	var linha;
	var achou = false;
	//reseta linha model 1
	if(instrucao.nome == "ADD.D" || instrucao.nome == "SUBD"){
		linha = reservationStation.adds[instrucao.posicaoUnidade];							
		achou = true;
	}
	else if(instrucao.nome == "MULTD" || instrucao.nome == "DIV.D"){
		linha = reservationStation.mult[instrucao.posicaoUnidade];							
		achou = true;
	}
	else if(instrucao.nome == "ADD" || instrucao.nome == "BEQ" || instrucao.nome == "BNEZ" || instrucao.nome == "DADDUI"){
		linha = reservationStation.integer[instrucao.posicaoUnidade];							
		achou = true;
	}
	if(achou){
		linha.busy = false;
		linha.op = "";
		linha.vj = "";
		linha.qj = "";
		linha.vk = "";
		linha.qk = "";	
	}
	//reseta linha model 3			
	if(instrucao.nome == "L.D"){
		linha = reservationStation.load[instrucao.posicaoUnidade];
		linha.address = "";
		linha.busy = false;
	}
	//reseta linha model2
	else if(instrucao.nome == "S.D"){
		linha = reservationStation.store[instrucao.posicaoUnidade];
		linha.address = "";
		linha.qj = "";
		linha.vj = "";
		linha.busy = false;
	}			
}

//TESTADA
function atualizaReservationStation(apelido,reservationStation,contGlobal,instrucao){
	var renomeamento = instrucao.op0+"_"+contGlobal.value;
	for(var i = 0; i < reservationStation.adds.length; i++){
		//renomeia instrucao na unidade de add
		if(reservationStation.adds[i].qj == apelido){
			reservationStation.adds[i].vj = renomeamento;
			reservationStation.adds[i].qj = "";
		}
		if(reservationStation.adds[i].qk == apelido){
			reservationStation.adds[i].vk = renomeamento;
			reservationStation.adds[i].qk = "";
		}
		// renomeia instrucao na unidade de inteiros
		if(reservationStation.integer[i].qj == apelido){
			reservationStation.integer[i].vj = renomeamento;
			reservationStation.integer[i].qj = "";
		}
		if(reservationStation.integer[i].qk == apelido){
			reservationStation.integer[i].vk = renomeamento;
			reservationStation.integer[i].qk = "";
		}
		// renomeia instrucao na unidade de store
		if(reservationStation.store[i].qj == apelido){
			reservationStation.store[i].vj = renomeamento;
			reservationStation.store[i].qj = "";
		}		
	}
	//renomeia instrucao na unidade de mult
	for (var i = 0; i < 2; i++){
		if(reservationStation.mult[i].qj == apelido){
			reservationStation.mult[i].vj = renomeamento;
			reservationStation.mult[i].qj = "";
		}
		if(reservationStation.mult[i].qk == apelido){
			reservationStation.mult[i].vk = renomeamento;
			reservationStation.mult[i].qk = "";
		}
	}	
}

//TESTADA
function despachar(pc,instrucao,clock,instructionStatus,reservationStation,registerFile,contGlobal){
	var unidadeEnome = acharUnidade(instrucao,reservationStation);
	var unidade = unidadeEnome[0];
	var nomeUnidade = unidadeEnome[1];	

	var i = 0;
	var linhaDisponivel = false;
	//verifico se a unidade está ocupada
	for(i = 0; i < unidade.length; i++){
		if(!unidade[i].busy){
			linhaDisponivel = true;
			break;
		}
	}
	if(linhaDisponivel){			
		//informei qual linha da unidade se encontra a dada instrução
		instrucao.posicaoUnidade = i;
		var posicaoNoFU = registerFile.acharPosicao(instrucao.op0);						

		//despachando para a unidade correta		
		if(nomeUnidade == "Add" || nomeUnidade == "Mult" || nomeUnidade == "Integer"){
			if(instrucao.nome == "BEQ"){
				unidade[i].op = instrucao.nome;
				var j = registerFile.acharPosicao(instrucao.op0);
				var k = registerFile.acharPosicao(instrucao.op1);
				if(registerFile.registerSolved[j] == true){
					if(registerFile.apelido[j] == ""){
						unidade[i].vj = instrucao.op0+"_"+contGlobal.value;
						contGlobal.value++;
					}
					else{
						unidade[i].vj = registerFile.apelido[j];
					}						
				}
				else{
					unidade[i].qj = registerFile.apelido[j];
				}
				if(registerFile.registerSolved[k] == true){
					if(registerFile.apelido[k] == ""){
						unidade[i].vk = instrucao.op1+"_"+contGlobal.value;
						contGlobal.value++;
					}
					else{
						unidade[i].vk = registerFile.apelido[k];
					}
				}
				else{
					unidade[i].qk = registerFile.apelido[k];
				}
			}
			else if(instrucao.nome == "BNEZ"){
				unidade[i].op = instrucao.nome;
				var j = registerFile.acharPosicao(instrucao.op0);				
				if(registerFile.registerSolved[j] == true){
					if(registerFile.apelido[j] == ""){
						unidade[i].vj = instrucao.op0+"_"+contGlobal.value;
						contGlobal.value++;
					}
					else{
						unidade[i].vj = registerFile.apelido[j];
					}						
				}
				else{
					unidade[i].qj = registerFile.apelido[j];
				}				
			}
			else{				
				unidade[i].op = instrucao.nome;
				var j = registerFile.acharPosicao(instrucao.op1);
				var k = registerFile.acharPosicao(instrucao.op2);
				if(registerFile.registerSolved[j] == true){
					if(registerFile.apelido[j] == ""){
						unidade[i].vj = instrucao.op1+"_"+contGlobal.value;
						contGlobal.value++;
					}
					else{
						unidade[i].vj = registerFile.apelido[j];
					}						
				}
				else{
					unidade[i].qj = registerFile.apelido[j];
				}
				if(registerFile.registerSolved[k] == true){
					if(registerFile.apelido[k] == ""){
						unidade[i].vk = instrucao.op2+"_"+contGlobal.value;
						contGlobal.value++;
					}
					else{
						unidade[i].vk = registerFile.apelido[k];
					}
				}
				else{
					unidade[i].qk = registerFile.apelido[k];
				}
			}					
		}
		else if(nomeUnidade == "Store"){
			if(registerFile.registerSolved[posicaoNoFU] == true){
				if(registerFile.apelido[posicaoNoFU] == ""){
					unidade[i].vj = instrucao.op0+"_"+contGlobal.value;
					contGlobal.value++;
				}
				else{
					unidade[i].vj = registerFile.apelido[posicaoNoFU];
				}						
			}
			else{
				unidade[i].qj = registerFile.apelido[posicaoNoFU];
			}
			unidade[i].address = instrucao.op1+"+"+instrucao.op2;
		}
		else{
			unidade[i].address = instrucao.op1+"+"+instrucao.op2;
		}		
		instructionStatus.matrizStatus[pc][0] = clock;
		unidade[i].busy = true;
		//
		if(instrucao.nome != "S.D" && instrucao.nome != "BEQ" && instrucao.nome != "BNEZ"){
			registerFile.registerSolved[posicaoNoFU] = false;
			var x = i+1;
			registerFile.apelido[posicaoNoFU] = nomeUnidade+x;
		}
		return true;
	}
	//não teve linha na unidade disponivel para ser despachado
	return false;
}

/*Função que acha qual unidade deve ir a instrucao
	TESTADA
*/ 
function acharUnidade(instrucao,reservationStation){
	if(instrucao.nome == "ADD.D" || instrucao.nome == "SUBD" /*|| instrucao.nome == "DADDUI"*/){
		return [reservationStation.adds,"Add"];
	}
	else if(instrucao.nome == "MULTD" || instrucao.nome == "DIV.D"){
		return [reservationStation.mult,"Mult"];
	}
	else if(instrucao.nome == "L.D"){
		return [reservationStation.load,"Load"];
	}
	else if(instrucao.nome == "S.D"){
		return [reservationStation.store,"Store"];
	}
	else{
		return [reservationStation.integer,"Integer"];
	}
}

//TESTADA
function resolveuTudo(lista){
	for(var i = 0; i < lista.length; i++){		
		if(lista[i] != true){
			return false;
		}
	}	
	return true;
}