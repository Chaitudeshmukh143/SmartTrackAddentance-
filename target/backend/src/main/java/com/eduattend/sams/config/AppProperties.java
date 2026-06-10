package com.eduattend.sams.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Cors cors = new Cors();
    private final Security security = new Security();
    private final Attendance attendance = new Attendance();
    private final FileStorage file = new FileStorage();

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins;
    }

    @Getter
    @Setter
    public static class Security {
        private final Jwt jwt = new Jwt();
    }

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long accessTokenExpirationMinutes;
        private long refreshTokenExpirationDays;
    }

    @Getter
    @Setter
    public static class Attendance {
        private int defaultExpiryMinutes;
        private int defaultRadiusMeters;
    }

    @Getter
    @Setter
    public static class FileStorage {
        private String uploadDir;
    }
}
