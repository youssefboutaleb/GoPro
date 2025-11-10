package com.medico.resources;

import com.medico.dto.ProductDTO;
import com.medico.entities.Product;
import com.medico.entities.TherapeuticClass;
import com.medico.repositories.ProductRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Products", description = "Product management endpoints")
public class ProductResource {
    
    @Inject
    ProductRepository productRepository;
    
    @GET
    @Operation(summary = "Get all products", description = "Retrieve all products")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Products retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProductDTO.class))
    )
    public Response getAllProducts() {
        List<Product> products = productRepository.findAllOrdered();
        
        List<ProductDTO> productDTOs = products.stream().map(product -> {
            ProductDTO dto = new ProductDTO();
            dto.setId(product.getId());
            dto.setName(product.getName());
            dto.setTherapeuticClass(product.getTherapeuticClass());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(productDTOs).build();
    }
    
    @GET
    @Path("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a specific product by ID")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Product retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProductDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Product not found"
    )
    public Response getProductById(@PathParam("id") UUID id) {
        Product product = productRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setTherapeuticClass(product.getTherapeuticClass());
        
        return Response.ok(dto).build();
    }
    
    @GET
    @Path("/therapeutic-class/{therapeuticClass}")
    @Operation(summary = "Get products by therapeutic class", description = "Retrieve all products with a specific therapeutic class")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Products retrieved successfully",
        content = @Content(schema = @Schema(implementation = ProductDTO.class))
    )
    public Response getProductsByTherapeuticClass(@PathParam("therapeuticClass") TherapeuticClass therapeuticClass) {
        List<Product> products = productRepository.findByTherapeuticClass(therapeuticClass);
        
        List<ProductDTO> productDTOs = products.stream().map(product -> {
            ProductDTO dto = new ProductDTO();
            dto.setId(product.getId());
            dto.setName(product.getName());
            dto.setTherapeuticClass(product.getTherapeuticClass());
            return dto;
        }).collect(Collectors.toList());
        
        return Response.ok(productDTOs).build();
    }
    
    @POST
    @Transactional
    @Operation(summary = "Create product", description = "Create a new product")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "201",
        description = "Product created successfully",
        content = @Content(schema = @Schema(implementation = ProductDTO.class))
    )
    public Response createProduct(@Valid @RequestBody ProductDTO productDTO) {
        Product product = new Product();
        product.setName(productDTO.getName());
        product.setTherapeuticClass(productDTO.getTherapeuticClass());
        
        productRepository.persist(product);
        
        productDTO.setId(product.getId());
        
        return Response.status(Response.Status.CREATED).entity(productDTO).build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update product", description = "Update an existing product")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "200",
        description = "Product updated successfully",
        content = @Content(schema = @Schema(implementation = ProductDTO.class))
    )
    @APIResponse(
        responseCode = "404",
        description = "Product not found"
    )
    public Response updateProduct(@PathParam("id") UUID id, @Valid @RequestBody ProductDTO productDTO) {
        Product product = productRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        
        product.setName(productDTO.getName());
        product.setTherapeuticClass(productDTO.getTherapeuticClass());
        
        productRepository.persist(product);
        
        productDTO.setId(product.getId());
        
        return Response.ok(productDTO).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete product", description = "Delete a product")
    @SecurityRequirement(name = "SecurityScheme")
    @APIResponse(
        responseCode = "204",
        description = "Product deleted successfully"
    )
    @APIResponse(
        responseCode = "404",
        description = "Product not found"
    )
    public Response deleteProduct(@PathParam("id") UUID id) {
        Product product = productRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        
        productRepository.delete(product);
        return Response.noContent().build();
    }
}

