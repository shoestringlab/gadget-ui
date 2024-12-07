function Toggle(options) {
    this.configure(options);
    this.create();
}

Toggle.prototype.configure = function (options) {
    this.selector = options.selector;
    this.parent = options.parent;
    this.shape = options.shape === undefined ? "square" : options.shape;
    this.value = options.initialValue === 1 ?  1 : 0;
};

Toggle.prototype.create = function () {
    this.element;
    if (this.selector !== undefined) {
        this.element = document.querySelector(this.selector);
    } else {
        this.element = document.createElement("input");
        this.element.type = "range";
        this.element.min = "0";
        this.element.max = "1";
        this.parent.addChild(this.element);
    }
    this.element.value = this.value;
    this.element.classList.add("gadget-ui-toggle");
    this.value = this.element.value;

    this.element.addEventListener("click", function(){
        //console.log(this);
        //myVal = (myVal == 1 ? 0: 1 );
      
        if( this.value  == 1 ){
            this.value  = 0;
          this.element.classList.add("gadget-ui-toggle-off");
        }else{
            this.value  = 1;
            this.element.classList.remove("gadget-ui-toggle-off");
        }
        this.element.value = myVal;
      
       // event.currentTarget.css.backgroundColor='#ccc';
      }.bind(this));
};
