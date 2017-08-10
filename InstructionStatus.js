var InstructionStatus = function(qtd){
	this.matrizStatus = [qtd][3];
	for(var item in this.matrizStatus){
		item[0] = 0;
		item[1] = 0;
		item[2] = 0;
	}
};