using AutoMapper;
using Backend.DTOs;
using Backend.Models;

namespace Backend.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // CreateMap<Source, Destination>()
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.PasswordSet, opt => opt.MapFrom(src => !string.IsNullOrEmpty(src.Password)));
        }
    }
}
