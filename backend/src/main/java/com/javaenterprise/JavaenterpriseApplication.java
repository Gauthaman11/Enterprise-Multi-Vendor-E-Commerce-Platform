package com.javaenterprise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class JavaenterpriseApplication {

	public static void main(String[] args) {
		SpringApplication.run(JavaenterpriseApplication.class, args);
	}

}
