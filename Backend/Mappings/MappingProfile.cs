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

            // Social Content Mappings
            CreateMap<SocialTopic, SocialTopicDto>();
            CreateMap<SocialTopicCreateDto, SocialTopic>();
            CreateMap<SocialTopicUpdateDto, SocialTopic>();

            CreateMap<SocialSection, SocialSectionDto>();
            CreateMap<SocialSectionCreateDto, SocialSection>();
            CreateMap<SocialSectionUpdateDto, SocialSection>();

            CreateMap<Media, MediaDto>();

            CreateMap<SocialSectionMedia, SocialSectionMediaDto>();
            CreateMap<SocialSectionMediaCreateDto, SocialSectionMedia>();
            CreateMap<SocialSectionMediaUpdateDto, SocialSectionMedia>();

            CreateMap<SocialRevision, SocialRevisionDto>();
        }
    }
}
