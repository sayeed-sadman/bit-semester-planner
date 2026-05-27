package ch.fhnw.bitsemesterplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class BitsemesterplannerApplication {

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Europe/Zurich"));
		SpringApplication.run(BitsemesterplannerApplication.class, args);
	}

}
