//using AutoMapper;
//using Api.Core.Dtos.Category;
//using Api.Core.Entities;
//using Api.Core.Validators;
//using Api.Repositories;
//namespace Api.Controllers;
//using Microsoft.AspNetCore.Mvc;
//using System.Collections.Generic;
//using System.Threading.Tasks;

//[Route("api/[controller]")]
//[ApiController]
//public class CategoryController : ControllerBase
//{
//    private readonly ICategoryRepository _categoryRepository;
//    private readonly IMapper _mapper;
//    private readonly IValidatorFactory _validatorFactory;

//    public CategoryController(ICategoryRepository categoryRepository, IMapper mapper, IValidatorFactory validatorFactory)
//    {
//        _categoryRepository = categoryRepository;
//        _mapper = mapper;
//        _validatorFactory = validatorFactory;
//    }

//    [HttpGet]
//    [Route("read")]
//    public async Task<ActionResult<IEnumerable<CategoryReadDto>>> GetCategories()
//    {
//        var categories = await _categoryRepository.GetAllAsync();
//        var categoryDto = _mapper.Map<IEnumerable<CategoryReadDto>>(categories);
//        return Ok(categoryDto);
//    }


//    [HttpGet("read/{id}")]
//    public async Task<ActionResult<CategoryReadDto>> GetCategoryById(string id)
//    {
//        var category = await _categoryRepository.GetByIdAsync(id);

//        var categoryDto = _mapper.Map<CategoryReadDto>(category);
//        return Ok(categoryDto);
//    }

//    [HttpPost("create")]
//    public async Task<ActionResult<Category>> CreateCategory([FromBody] CategoryCreateDto dto)
//    {
//        var validator = _validatorFactory.GetValidator<Category>();
//        var newCate = _mapper.Map<Category>(dto);
//        var validationResult = validator.Validate(newCate);
//        if (!validationResult.IsValid)
//        {
//            return BadRequest(validationResult.Errors);
//        }
//        await _categoryRepository.CreateAsync(newCate);
//        return Ok(new { message = "Successfully created Category" });
//    }

//    [HttpPut("update/{id}")]
//    public async Task<IActionResult> UpdateCategory(string id, [FromBody] CategoryUpdateDto dto)
//    {
//        var category = await _categoryRepository.GetByIdAsync(id);

//        var validator = _validatorFactory.GetValidator<Category>();
//        var validationResult = validator.Validate(category);
//        if (!validationResult.IsValid)
//        {
//            return BadRequest(validationResult.Errors);
//        }
//        _mapper.Map(dto, category);
//        await _categoryRepository.UpdateAsync(category);
//        return Ok(new { message = $"Successfully update category with id: {id}" });
//    }

//    [HttpDelete("delete/{id}")]
//    public async Task<IActionResult> DeleteCategory(string id)
//    {

//        await _categoryRepository.DeleteByIdAsync(id);
//        return Ok(new { message = $"Successfully deleted Category with id: {id}" });
//    }
//}