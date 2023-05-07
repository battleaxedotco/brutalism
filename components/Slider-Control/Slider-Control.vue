<template>
    <div class="slider-control-wrapper">
        <div :class="['slider-control-container', { 'inline': inline }]" :style="`font-size: ${size}px`" >
            
            <div class="input-scroll-label" :style="`min-width: ${labelSize * size}px`" >
                {{ label }}
            </div>

            <div v-if="!inline" class="slider-control-label"  >
                <Input-Scroll @focus="isDragging = true" @blur="isDragging = false" v-model="val" :min="min" :max="max" :size="size" :steps="steps"  :toFixed="fractionalLength" :thin="false" />
            </div>

            <div class="slider-hitbox" ref="hitbox" @click="clickSlider" v-pan.prevent.mouse="panSlider"
                :style="hitBoxHeight">
                <div class="slider-control-value" ref="track">
                    <div :class="['slider-control-slider', isDragging ? 'active' : 'idle']" ref="slider"
                        :style="sliderStyle" />
                </div>
            </div>

            <div v-if="inline" class="slider-control-label" :class="{ 'slider-inline-label': inline }" >
                <Input-Scroll @focus="isDragging = true" @blur="isDragging = false" v-model="val" :min="min" :max="max"  :size="size"  :steps="steps" :toFixed="fractionalLength" :style="`width: ${Math.ceil(this.valLength * size)}px`"/>
            </div>
    </div>
</div></template>

<script>
export default {
    props: {
        label: {
            type: String,
            default: "",
        },
        labelSize: {
            type: Number,
            default: 10,
        },
        value: {
            type: Number,
            default: 0,
        },
        debug: {
            type: Boolean,
            default: false,
        },
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 100,
        },
        inline: {
            type: Boolean,
            default: false,
        },
        size: {
            type: Number,
            default: 12,
        },
    },
    data: () => ({
        slider: null,
        track: null,
        val: null,
        sliderPos: null,
        isDragging: false,
        windowResizeCounter: 0,
    }),
    watch: {
        sliderPos(newPos) {
            this.sliderPos = Math.min(Math.max(newPos, 0), this.trackWidth);
            this.val = newPos / this.trackWidth * (this.max - this.min) + this.min;
        },

        val(newValue, oldValue){
            const delta = Math.abs(oldValue - newValue);
            if (delta > this.steps[0]){
                this.sliderPos = (newValue-this.min)/(this.max-this.min)*this.trackWidth;
            }
        }

    },
    mounted() {

        this.$nextTick(() => {
            // Update $refs here.
            this.slider = this.$refs.slider;
            this.track = this.$refs.track;
            this.sliderPos = (this.value - this.min) / (this.max - this.min) * this.trackWidth;

        });

        window.addEventListener('resize', this.onWindowResize)

    },
    destroyed(){
        window.removeEventListener('resize', this.onWindowResize)
    },
    directives: {
        pan: require("vue-pan").default,
    },
    methods: {
        onWindowResize() {
            this.windowResizeCounter++;
        },

        clickSlider(evt) {
                this.sliderPos =  evt.clientX - this.trackRect.left;
        },

        
        panSlider(evt) {

            if (evt.isFirst) {
                this.isDragging = true;
                this.$nextTick(() => {
                    document.documentElement.style.cursor = 'auto'
                })
            } 
            else if (evt.isFinal) {
                this.isDragging = false;
            }
            
            this.sliderPos = evt.position.left - this.trackRect.left;
              
        },
        
        
    },
    computed: {
        steps() {
            const multiplier = 1 / this.fractionalLength;
            return [multiplier * .01, multiplier * .1, multiplier * 1];
        },
        valLength(){
            let decimalLength = this.max.toString().length;
            return decimalLength + this.fractionalLength;
        },
        fractionalLength(){
            let digits = (this.max - this.min).toString().length;
            return Math.max(0, Math.floor(Math.log10(100 / digits)))
        },
       sliderRect() {
            this.windowResizeCounter;
            return this.slider?.getBoundingClientRect();
        },
        trackRect() {
            this.windowResizeCounter;
            return this.track?.getBoundingClientRect();
        },
        heightOffset() {
            return (this.sliderRect?.height / 2 ?? 0) * -1 + 2;
        },
        widthOffset() {
            return (this.sliderRect?.width / 2 ?? 0) * -1;
        },
        trackWidth() {
            return this.trackRect?.width ?? 0;
        },
        
        sliderStyle() {
            return `
                top: ${this.heightOffset}px;
                left: ${this.widthOffset + this.sliderPos}px;
            `;

        },
        hitBoxHeight() {
            return `height: ${this.heightOffset * -2 + 4}px;`;
        },
    }
};
</script>
<style scoped>
.wrapper>.slider-control-wrapper {
    margin-top: 0px;
}


.slider-control-wrapper {
    width: 100%;
    box-sizing: border-box;
}

.slider-control-container {
    display: flex;
    flex-direction: column;
    font-family: "Open Sans", sans-serif;
    color: var(--color-icon);

    flex-wrap: nowrap;
    justify-content: flex-start;
    position: relative;
    /* padding: 0px 4px; */
    /* height: 25px; */
    align-items: baseline;
}

.slider-control-container.inline {
    display: flex;
    flex-direction: row;
    align-items: center;

}

.slider-hitbox {
    /* background: rgba(255, 0, 0, 0.5); */
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: auto;
}

.slider-control-value {
    position: relative;
    box-sizing: border-box;
    height: 4px;
    width: 100%;
    border-radius: 10px;
    background: var(--color-header);
    margin: 0px 5px 0px 10px;
    
}

.slider-control-slider {
    position: absolute;
    border-radius: 9px;
    border-width: 2px;
    border-style: solid;
    width: 10px;
    height: 10px;
    background-color: var(--color-bg);
    border-color: var(--tabs-idle-hover);
}

.slider-control-slider.idle {
    border-color: var(--tabs-idle-hover);
}

.slider-control-slider.active {
    border-color: var(--color-icon);
    background-color: var(--color-icon);

}

@media (max-width: 599px) {
    .slider-control-label {
        margin-bottom: 8px;
    }
}

.inline .slider-control-label {
    margin-right: 8px;
}



.slider-control-container.inline .slider-control-label {
    margin-right: 8px;
}

.slider-control-container.inline .slider-control-label.slider-inline-label {
    margin-bottom: 0;
}

.slider-control-container.inline .slider-hitbox {
    flex-grow: 1;
}

.slider-control-container.inline .slider-control-label:first-of-type {
    margin-right: auto;
}

.slider-control-container.inline .slider-control-label:last-of-type {
    margin-right: 0;
}

.slider-control-container.inline .slider-control-label:not(:first-of-type):not(:last-of-type) {
    display: none;
}

.input-scroll-label {
    display: flex;
    white-space: pre;
    width: fit-content;
    flex-wrap: nowrap;
    margin-right: 3px;
    margin-bottom: 2px;
    user-select: none;
    cursor: auto;

}

</style>
