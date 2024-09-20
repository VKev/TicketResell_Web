﻿using AutoMapper;
using Backend.Core.Dtos.Revenue;
using Backend.Core.Entities;
using Backend.Core.Dtos.User;

namespace Backend.Core.AutoMapperConfig
{
    public class AutoMapperConfigProfile : Profile
    {
        public AutoMapperConfigProfile() 
        {
            CreateMap<UserCreateDto, User>();
            
            //Revenue
            CreateMap<RevenueCreateDto, Revenue>();
            CreateMap<Revenue,RevenueReadDto>();
            CreateMap<RevenueUpdateDto, Revenue>();
        }
    }
}
