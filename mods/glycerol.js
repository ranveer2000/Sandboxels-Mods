// Glycerol and Nitro Compounds Mod
// Author: Anonymous
// Version: 1.0

// First, ensure nitric acid exists (it doesn't in base game)
elements.nitric_acid = {
    name: "Nitric Acid",
    color: "#F0E68C", // Pale yellow
    behavior: behaviors.LIQUID,
    category: "acids",
    state: "liquid",
    density: 1510, // 1.51 g/cm³
    tempHigh: 83, // Boiling point
    tempLow: -42, // Freezing point
    viscosity: 1.2, // Slightly thicker than water
    reactions: {
        "water": { elem1: "diluted_nitric_acid", elem2: "diluted_nitric_acid" },
        "metal": { elem1: null, elem2: "metal_oxide", tempMin: 20 },
    },
    acid: true,
    acidStrength: 0.8,
    burn: 0, // Doesn't burn, but is an oxidizer
}

elements.diluted_nitric_acid = {
    name: "Diluted Nitric Acid",
    color: "#F5F5DC",
    behavior: behaviors.LIQUID,
    category: "acids",
    state: "liquid",
    density: 1250,
    tempHigh: 100,
    tempLow: 0,
    viscosity: 1.1,
    acid: true,
    acidStrength: 0.3,
}

elements.glycerol = {
    name: "Glycerol",
    color: "#E6E6FA", // Lavender-tinted clear
    behavior: behaviors.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1261, // 1.261 g/cm³
    tempHigh: 290, // Boiling point
    tempLow: 17.8, // Melting point
    viscosity: 934, // Extremely viscous
    burn: 40,
    burnTime: 8,
    fireColor: "#FFE4B5",
    stain: -0.1,
    
    reactions: {
        "water": { 
            elem1: "glycerol_solution", 
            elem2: "glycerol_solution",
            chance: 0.3
        },
        "nitric_acid": {
            elem1: null,
            elem2: "nitroglycerin",
            tempMin: 20,
            tempMax: 30,
            oneway: true,
            chance: 0.2
        },
        "sulfuric_acid": { // Catalyst for nitroglycerin
            elem1: null,
            elem2: "nitroglycerin",
            tempMin: 20,
            tempMax: 25,
            oneway: true,
            chance: 0.4
        },
    },
    
    tick: function(pixel) {
        // Freezing/thawing behavior
        if (pixel.temp <= 17 && pixel.state !== "solid") {
            pixel.state = "solid";
            pixel.color = "#F0F0FF";
        } else if (pixel.temp > 18 && pixel.state === "solid") {
            pixel.state = "liquid";
            pixel.color = "#E6E6FA";
        }
    },
}

elements.glycerol_solution = {
    name: "Glycerol Solution",
    color: "#DCDCF0",
    behavior: behaviors.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1100,
    tempHigh: 100,
    tempLow: 0,
    viscosity: 100,
    stain: -0.05,
    
    reactions: {
        "nitric_acid": {
            elem1: null,
            elem2: "nitroglycerin",
            tempMin: 20,
            chance: 0.1
        },
    },
}

elements.nitroglycerin = {
    name: "Nitroglycerin",
    color: "#FFFACD", // Pale yellow
    behavior: behaviors.LIQUID,
    category: "explosives",
    state: "liquid",
    density: 1590,
    tempHigh: 50, // Decomposes/explodes
    tempLow: 13, // Freezes at 13°C (dangerous when frozen!)
    viscosity: 3.7,
    
    // Explosive properties
    explosive: true,
    explosionPower: 80, // Very powerful
    explosionResistance: 0,
    
    reactions: {
        "heat": { // Any heat source can trigger
            elem1: "explosion",
            elem2: null,
            tempMin: 50,
            chance: 1
        },
        "shock": { // Reacts to physical impact
            elem1: "explosion",
            elem2: null,
            chance: 0.3
        },
    },
    
    tick: function(pixel) {
        // Temperature sensitivity
        if (pixel.temp >= 50) {
            explodeAt(pixel.x, pixel.y);
            return;
        }
        
        // Freezing warning (more sensitive when frozen/thawing)
        if (pixel.temp <= 13 && pixel.temp >= 10) {
            // Dangerous zone - can explode from small disturbance
            if (Math.random() < 0.001) {
                explodeAt(pixel.x, pixel.y);
                return;
            }
        }
        
        // Shock sensitivity - check for nearby moving elements
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                if (!isEmpty(pixel.x+i, pixel.y+j)) {
                    let neighbor = pixelMap[pixel.x+i][pixel.y+j];
                    // If something heavy or fast-moving hits it
                    if (neighbor.element === "stone" || neighbor.element === "metal" || 
                        neighbor.vx > 0.1 || neighbor.vy > 0.1) {
                        if (Math.random() < 0.1) {
                            explodeAt(pixel.x, pixel.y);
                            return;
                        }
                    }
                }
            }
        }
        
        // Very unstable - small chance to explode randomly
        if (Math.random() < 0.0001) {
            explodeAt(pixel.x, pixel.y);
            return;
        }
    },
}

// Add sulfuric acid if it doesn't exist (for catalyst)
if (!elements.sulfuric_acid) {
    elements.sulfuric_acid = {
        name: "Sulfuric Acid",
        color: "#E8E8E8",
        behavior: behaviors.LIQUID,
        category: "acids",
        state: "liquid",
        density: 1840,
        tempHigh: 337,
        tempLow: 10,
        viscosity: 24,
        acid: true,
        acidStrength: 0.9,
        reactions: {
            "water": { elem1: "diluted_sulfuric_acid", elem2: "diluted_sulfuric_acid" },
        },
    }
    
    elements.diluted_sulfuric_acid = {
        name: "Diluted Sulfuric Acid",
        color: "#F0F0F0",
        behavior: behaviors.LIQUID,
        category: "acids",
        state: "liquid",
        density: 1200,
        tempHigh: 100,
        tempLow: 0,
        viscosity: 2,
        acid: true,
        acidStrength: 0.4,
    }
}

console.log("Glycerol & Nitro Compounds Mod loaded!");
console.log("Elements added: nitric_acid, glycerol, glycerol_solution, nitroglycerin" + 
            (elements.sulfuric_acid ? ", sulfuric_acid" : ""));