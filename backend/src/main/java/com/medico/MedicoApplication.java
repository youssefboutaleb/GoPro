package com.medico;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.annotations.QuarkusMain;

@QuarkusMain
public class MedicoApplication {
    
    public static void main(String[] args) {
        Quarkus.run(args);
    }
}