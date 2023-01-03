import React, { Component } from 'react'
import { sliderData } from './sliderData'
import SimpleImageSlider from 'react-simple-image-slider'
import format from './styles/Slider.css'

export default class Slider extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sliderIndex: 0
        }
    }
    render() {
        return (
            <div className='slider'>
                <SimpleImageSlider
                    width={1519}
                    height={519}
                    images={sliderData}
                    navStyle={1}
                    showNavs={true}
                    autoPlay={true}
                    style={format}
                />
            </div>
        )
    }
}
