
export interface AvatarLayerOptions {
    id: string;
    avatarUrl: string;
    position: [number, number];
    scale?: number;
}

// Simplified version for now - avoiding parameter properties that cause erasableSyntaxOnly errors
export class AvatarLayer implements mapboxgl.CustomLayerInterface {
    id: string;
    type = 'custom' as const;
    renderingMode = '3d' as const;

    private options: AvatarLayerOptions;

    constructor(options: AvatarLayerOptions) {
        this.id = options.id;
        this.options = options;
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        console.log('Avatar layer added:', this.options, map, gl);
    }

    onRemove() {
        console.log('Avatar layer removed');
    }

    render(gl: WebGLRenderingContext, matrix: number[]) {
        console.log('Avatar layer render:', gl, matrix);
    }
}
