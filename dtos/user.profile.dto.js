class UserCreateDto {
    constructor(userCreateDto) {
        this.email = userCreateDto.email;
        this.username = userCreateDto.username;
        this.password = userCreateDto.password;
        this.last_name = userCreateDto.last_name;
        this.first_name = userCreateDto.first_name;
        this.gender = userCreateDto.gender;
        this.preference = userCreateDto.preference;
        this.biography = userCreateDto.biography;
        this.age = userCreateDto.age;
        this.gps_allowed_at = userCreateDto.gps_allowed_at;
        this.created_at = userCreateDto.created_at;
        this.profileImage = userCreateDto.profileImage;
    }
}