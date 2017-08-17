var RegisterFile = function(){
	//de 0 até 16 ficam os reg de FP, depois ficam os inteiros
	this.nome = [48];
	this.apelido = [48];
	this.registerSolved = [48];

	var cont = 0;
	for(var i = 0; i < 16; i++ ){
		this.nome[i] = "F"+(2*i);
		this.nome[i+16] = "R"+i;
		this.nome[i+32] = "R"+(i+16);
		this.registerSolved[i] = true;
		this.registerSolved[i+16] = true;
		this.registerSolved[i+32] = true;
		
		this.apelido[i] = "";
		this.apelido[i+16] = "";
		this.apelido[i+32] = "";
	}

	this.acharPosicao = function(nome1){
		for(var i = 0; i < 48; i++){
			if(nome1 == this.nome[i]){
				return i;
			}
		}
	};
};