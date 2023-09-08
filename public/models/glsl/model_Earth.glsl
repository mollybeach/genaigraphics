// Define the signed distance function (SDF) of your object here
    float surfaceDistance(vec3 p) {
      return sphere(p, 0.3);
    }
    
    float fractal(vec3 p) {
        float v = 0.0;
        float amp = 1.0;
        for (int i=0; i<5; i++) {
            v += noise(p)*amp;
            amp *= 0.5;
            p *= 2.0;
        }
        return v;
    } 
    
    // Here you can define how your object at point p will be colored.
    vec3 shade(vec3 p, vec3 normal) {
        vec3 lightDirection = vec3(0.0, 1.0, 0.0);
        float n = fractal(6.0*p)*0.5+0.5;
        float light = simpleLighting(p, normal, lightDirection);
        float spec = clamp(0.0000003*pow(light*2.0,n*50.0),0.0,1.0);
        light = light*light*light*light;
        light += spec;
        vec3 color = vec3(1.0, 1.0, 1.0);
        if (spec < 0.2) {
            color.rg = vec2(0.0);
        } else {
            color = vec3(0.141,0.510,0.082);
        }
      return color*light;
    }