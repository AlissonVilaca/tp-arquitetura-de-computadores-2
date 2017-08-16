var ReservationStation = function(){
	this.adds = [3];
	this.mult = [2];
	this.store = [3];
	this.load = [6];
	this.integer = [3];	

	for(var i = 0; i < 3; i++){
		this.adds[i] = new LineModel1();
		this.store[i] = new LineModel2();
		this.integer[i] = new LineModel1();
		this.load[i] = new LineModel3();
		this.load[i+3] = new LineModel3();		
	}
	this.mult[0] = new LineModel1();
	this.mult[1] = new LineModel1();	
};