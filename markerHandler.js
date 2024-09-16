var modelList = [];

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    this.el.addEventListener('markerFound', () => {
        const marker = this.el;
        const barcodeValue = marker.getAttribute('barcode'); 
        const modelName = marker.getAttribute('model-name');

        if (!isModelPresentInArray(modelName, barcodeValue)) {
            modelList.push({
            name: modelName,
            barcode: barcodeValue,
            position: marker.object3D.position, 
            visible: true
        });
        }
        marker.setAttribute('visible', true);
    });

    this.el.addEventListener('markerLost', () => {
        const marker = this.el;
        const barcodeValue = marker.getAttribute('barcode'); 
        const modelName = marker.getAttribute('model-name'); 
        const modelIndex = modelList.findIndex(model => model.name === modelName && model.barcode === barcodeValue);

            if (modelIndex !== -1) {
                modelList.splice(modelIndex, 1);
            }
        });
    },

    isModelPresentInArray: function (arr, val) {
        for (var i of arr) {
            if (i.model_name === val) {
                return true;
            }
        }
        return false;
    },

    tick: async function () {
        if(modelList.length > 1) {
            var isBaseModelPresent = this.isModelPresentInArray(modelList, "base");
            var messageText = document.querySelector("#message-text");

            if(!isBaseModelPresent) {
                messageText.setAttribute("visible", true);
            } else {
                if (models === null) {
                    models = await this.getModel();
                }

                messageText.setAttribute("visible", false);
                this.placeTheModel("road", models);
                this.placeTheModel("car", models);
                this.placeTheModel("sun", models);
            }
        }
    },
    
    getDistance: function (elA, elB) {
        return elA.object3D.position.distanceTo(elB.object3D.position);
    },

    getModelGeometry: function () {
        var barcode = Object.keys(models);
        for (var barcode of barcodes) {
            if (models[barcode].model_name === modelName) {
                return {
                    position: models[barcode]["placement_position"],
                    rotation: models[barcode]["placement_rotation"],
                    scale: models[barcode]["placement_scale"],
                    model_url: models[barcode]["model_url"],
                };
            }
        }
    },

    placeTheModel: function(modelName, models) {
        var isListContainModel =  this.isModelPresentInArray(modelList, modelName);
        if (isListContainModel) {
            var distance = null;
            var marker1 = document.querySelector(`#marker-base`);
            var marker2 = document.querySelector(`marker-${modelName}`);

            distance = this.getDistance(marker1, marker2);
            if (distance < 1.25) {
                var modelEl = document.querySelector(`#${modelName}`);
                modelEl.setAttribute("visible", false);

                var isModelPlaced = document.querySelector(`#model-${modelName}`);
                if (isModelPlaced === null) {
                    var el = document.createElement("a-entity");
                    el.setAttribute("id", `model-${modelName}`);
                    el.setAttribute("gltf-model", `url(${modelGeometry.model_url})`);
                    el.setAttribute("position", modelGeometry.position);
                    el.setAttribute("rotation", modelGeometry.rotation);
                    el.setAttribute("scale", modelGeometry.scale);
                }
            }
        }
    }
});
