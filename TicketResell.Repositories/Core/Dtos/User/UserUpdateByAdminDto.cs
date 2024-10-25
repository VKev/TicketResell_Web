﻿using Repositories.Core.Dtos.Role;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Core.Dtos.User
{
    public class UserUpdateByAdminDto
    {
        public string? Username { get; set; }

        public string? Gmail { get; set; }

        public string? Phone { get; set; }

        public string? Fullname { get; set; }

        public string? Sex { get; set; }

        public string? Address { get; set; }

        public DateTime? Birthday { get; set; }

        public string? Bio { get; set; }

        public string? Bank { get; set; }

        public string? BankType { get; set; }



    }
}
