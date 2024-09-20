namespace Backend.Repositories.Revenues;
using Revenue= Backend.Core.Entities.Revenue;
public interface IRevenueRepository
{
    Task CreateRevenue(Revenue revenue);
    
    Task<IEnumerable<Revenue>> GetRevenues();
    
    Task<Revenue?> GetRevenuesById(string id);

    Task<List<Revenue>> GetRevenuesBySellerId_Month(string id, string type); 
    
    Task UpdateRevenue(Revenue revenue);
    
    Task<List<Revenue>> GetRevenuesBySellerId(string id);

    Task DeleteRevenue(Revenue revenue);

}