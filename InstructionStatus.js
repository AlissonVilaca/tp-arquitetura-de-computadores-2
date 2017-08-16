var InstructionStatus = function(qtd){	
	this.matrizStatus = [qtd];
	for(var i = 0; i < qtd; i++){
		this.matrizStatus[i] = [3];
		for(var j = 0; j < 3; j++){
			this.matrizStatus[i][j] = 0;
		}
	}
};