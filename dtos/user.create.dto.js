

class UserCreateDto {
    constructor(data) {
        this.email = data.email;
        this.username = data.username;
        this.password = data.password;
        this.last_name = data.lastName;
        this.first_name = data.firstName;
        this.gender = data.gender;
        this.preference = data.preference;
        this.biography = data.biography;
        this.age = data.age;
        this.gpsAllowedAt = data.gpsAllowedAt;
        this.hashtag = data.hashtag;
        this.location = data.location;
        //this.created_at = data.createdAt;
        this.profileImage = data.profileImage;
    }
}