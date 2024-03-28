var modelList = [];

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    var models = await this.getModels();

    this.el.addEventListener("markerFound", () => {
      var modelName = this.el.getAttribute("model_name");
      var barcodeValue = this.el.getAttribute("value");
      modelList.push({ model_name: modelName, barcode_value: barcodeValue });

      models[barcodeValue]["models"].map(item => {
        var model = document.querySelector(`#${item.model_name}-${barcodeValue}`);
        model.setAttribute("visible", false);
      });
    });

    this.el.addEventListener("markerLost", () => {
      var modelName = this.el.getAttribute("model_name");
      var index = modelList.findIndex(x => x.model_name === modelName);
      if (index > -1) {
        modelName.splice(index, 1);
      }
    });
  },
  isModelPresentInArray:function(arr,val){
    for (var i of arr){
      if(i.model_name===val){
        return true;
      }
    }
    return false;
  },
  tick: async function () {
    if (modelList.length > 1) {
      var isModelPresent= this.isModelPresentInArray(modelList,"base")
      var messageText = document.querySelector("#message-text")

      if(!isModelPresent){
        messageText.setAttribute("visible",true)
      }else{
        if(models==null){
          models=await this.getModels();
        }
      }

      messageText.setAttribute("visible",false)
      this.placeTheModel("car","models")
      this.placeTheModel("building1","models")
      this.placeTheModel("building2","models")
      this.placeTheModel("building3","models")
      this.placeTheModel("tree","models")
      this.placeTheModel("sun","models")
    }
  },
  //Calculate distance between two position markers
  getDistance: function (elA, elB) {
    return elA.object3D.position.distanceTo(elB.object3D.position);
  },
  
  getModelGeometry: function () {
    var barcodes = Object.keys(models)
    for(var barcode of barcodes){
      if(models[barcode].model_name === modelName){
        return{
          position:models[barcode]["placement_position"],
          rotation:models[barcode]["placement_rotation"],
          scale:models[barcode]["placement_scale"],
          model_url:models[barcode]["model_url"]
        }
    }
  }
  },
  placeTheModel:function(){
    var isListContainModel= this.isModelPresentInArray(modelList,modelName)
    if(isListContainModel){
      var distance=null
      var marker1=document.querySelector(`#marker-base`)
      var marker2=document.querySelector( `#marker-${modelName}`)
      distance=this.getDistance(marker1,marker2)
      if(distance<1.25){
        var modelEl=document.querySelector(`#${modelName}`)
        modelEl.setAttribute("visible",false)
        var isModelPlaced=document.querySelector(`#marker-${modelName}`)
        if(isModelPlaced===null){
          var el=this.setAttribute("visible",false)
          var modelGeometry=tjhis.getModelGeometry(models,modelName)
          el.setAttribute("id",`model-${modelName}`)
          el.setAttribute("gltf-model",`url(${modelGeometry.model_url})`)
          el.setAttribute("position",modelGeometry.position)
          el.setAttribute("rotation",modelGeometry.rotation)
          el.setAttribute("scale",modelGeometry.scale)
          marker1.appendChild(el)
        }
      }
    }
  },
  getModel: function () {
    // NOTE: Use ngrok server to get json values
    return fetch("model.json")
      .then(res => res.json())
      .then(data => data);
  },
});
