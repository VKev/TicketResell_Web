using System;
using App.MVVMs.ViewModels;
using Microsoft.UI.Xaml.Controls;

namespace App.MVVMs.Views.Detail
{
    public sealed partial class TicketDetail : Page, IDisposable
    {
        public TicketDetailViewModel ViewModel { get; set; }

        public TicketDetail(TicketDetailViewModel viewModel)
        {
            ViewModel = viewModel;
            this.InitializeComponent();
        }

        public void Dispose()
        {
            ViewModel = null;
        }
    }
}