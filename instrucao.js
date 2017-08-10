var Instrucao = function (nome,op0,op1,op2,latencia) {
	this.nome = nome;
	this.op0 = op0;
	this.op1 = op1;
	this.op2 = op2;
	this.latencia = latencia;
	this.posicaoUnidade = -1;	
};