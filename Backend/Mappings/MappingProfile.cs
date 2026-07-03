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
                .ForMember(dest => dest.PasswordSet, opt => opt.MapFrom(src => !string.IsNullOrEmpty(src.Password)))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : string.Empty));

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

            CreateMap<SocialReference, SocialReferenceDto>();

            // About Content Mappings
            CreateMap<AboutTopic, AboutTopicDto>();
            CreateMap<AboutTopicCreateDto, AboutTopic>();
            CreateMap<AboutTopicUpdateDto, AboutTopic>();

            CreateMap<AboutSection, AboutSectionDto>();
            CreateMap<AboutSectionCreateDto, AboutSection>();
            CreateMap<AboutSectionUpdateDto, AboutSection>();

            CreateMap<AboutSectionMedia, AboutSectionMediaDto>();
            CreateMap<AboutSectionMediaCreateDto, AboutSectionMedia>();
            CreateMap<AboutSectionMediaUpdateDto, AboutSectionMedia>();

            CreateMap<AboutRevision, AboutRevisionDto>();

            CreateMap<AboutReference, AboutReferenceDto>();

            // News and Videos
            CreateMap<NewsArticle, NewsArticleDto>();
            CreateMap<NewsArticleTranslation, NewsArticleTranslationDto>();
            CreateMap<NewsArticleCreateDto, NewsArticle>();
            CreateMap<NewsArticleTranslationCreateDto, NewsArticleTranslation>();
            CreateMap<NewsArticleUpdateDto, NewsArticle>();

            CreateMap<Video, VideoDto>();
            CreateMap<VideoCreateDto, Video>();
            CreateMap<VideoUpdateDto, Video>();
        }
    }
}
